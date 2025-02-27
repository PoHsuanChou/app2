import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initializeWebSocket, 
  sendWebSocketMessage, 
  addMessageListener,
  disconnectWebSocket,
  isConnected,
  subscribeToChat,
  requestChatHistory
} from '../services/websocket';

const MatchChatScreen = ({ route, navigation }) => {
  const { matchData } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const flatListRef = useRef(null);

  // 初始化 WebSocket 連接
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        await initializeWebSocket();
        setWsConnected(true);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setWsConnected(false);
      }
    };

    setupWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);
  

  // 獲取用戶信息和設置消息監聽
  useEffect(() => {
    const setup = async () => {
      // 獲取用戶信息
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setUserId(userId);
          console.log('userId:', userId);
        } else {
          console.log('No userId found');
        }
      } catch (error) {
        console.error('Error fetching user userId:', error);
      } finally {
        setIsLoading(false); // 完成加載
      }
    };

    setup();
  }, []);

  // 訂閱聊天室和請求聊天歷史
  useEffect(() => {
    if (wsConnected && userId && matchData.id) {
      const chatRoomId = getChatRoomId(userId, matchData.id);
      
      // 進入聊天室時訂閱
      const messageSubscription = subscribeToChat(chatRoomId, (message) => {
        const wsMessage = JSON.parse(message.body);
        if (wsMessage.chatRoomId === chatRoomId) {
          const newMessage = {
            id: wsMessage.id || Date.now().toString(),
            text: wsMessage.content,
            sender: wsMessage.senderId === userId ? 'user' : 'match',
            timestamp: new Date(wsMessage.timestamp),
            status: 'received'
          };

          setMessages(prevMessages => [...prevMessages, newMessage]);
          
          // 滾動到最新消息
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      });
      
      // 訂閱聊天歷史記錄
      const historySubscription = addMessageListener(`/user/${userId}/queue/chat-history`, (history) => {
        console.log('Raw chat history received:', history);
        
        try {
          const historyMessages = JSON.parse(history.body);
          console.log('Parsed chat history:', historyMessages);
          
          if (Array.isArray(historyMessages)) {
            const formattedMessages = historyMessages.map(msg => ({
              id: msg.id || Date.now().toString(),
              text: msg.content,
              sender: msg.senderId === userId ? 'user' : 'match',
              timestamp: new Date(msg.timestamp),
              status: 'received'
            }));
            
            console.log('Formatted chat history:', formattedMessages);
            setMessages(formattedMessages);
            
            // 滾動到最新消息
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          } else {
            console.warn('Received chat history is not an array:', historyMessages);
          }
        } catch (error) {
          console.error('Error parsing chat history:', error, 'Raw data:', history.body);
        }
      });
      
      // 請求聊天歷史
      requestChatHistory(chatRoomId);
      
      return () => {
        // 離開聊天室時取消訂閱
        if (messageSubscription) {
          messageSubscription.unsubscribe();
        }
        if (historySubscription) {
          historySubscription.unsubscribe();
        }
      };
    }
  }, [wsConnected, userId, matchData.id]);

  const getChatRoomId = (userIdA, userIdB) => {
    return userIdA < userIdB ? `${userIdA}_${userIdB}` : `${userIdB}_${userIdA}`;
  };

  const chatRoomId = getChatRoomId(userId, matchData.id);

  // 設置標題欄
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('UserProfile', { userData: matchData })}
          style={styles.headerTitleContainer}
        >
          <Image 
            source={matchData.image} 
            style={styles.headerAvatar} 
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>
              {matchData.name.includes('@') 
                ? matchData.name.split('@')[0] 
                : matchData.name}
            </Text>
            {matchData.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            // 這裡可以添加更多選項的處理邏輯
            console.log('More options pressed');
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, matchData]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || !wsConnected) return;

    setIsLoading(true);
    
    try {
      const newMessage = {
        id: Date.now().toString(),
        text: trimmedMessage,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending'
      };

      // 立即更新 UI
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage(''); // 立即清空輸入框

      // 滾動到最新消息
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      // 發送消息
      console.log('matchData test', matchData);
      
      const messagePayload = {
        type: 'TEXT',
        chatRoomId: chatRoomId,
        content: trimmedMessage,
        senderId: userId,
        receiverId: matchData.id,
        timestamp: new Date().toISOString()
      };
      console.log('matchData', matchData);
      console.log('messagePayload', messagePayload);

      await sendWebSocketMessage(messagePayload);

      // 更新消息狀態為已發送
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // 更新消息狀態為發送失敗
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'failed' } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const retryMessage = async (failedMessage) => {
    try {
      // 更新消息狀態為重試中
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === failedMessage.id ? { ...msg, status: 'sending' } : msg
        )
      );

      const messagePayload = {
        type: 'TEXT',
        chatRoomId: chatRoomId,
        content: failedMessage.text,
        senderId: userId,
        timestamp: new Date().toISOString()
      };

      await sendWebSocketMessage(messagePayload);

      // 更新消息狀態為已發送
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === failedMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

    } catch (error) {
      console.error('Retry failed:', error);
      
      // 更新消息狀態為發送失敗
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === failedMessage.id ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessageContainer : styles.matchMessageContainer
    ]}>
      {item.sender === 'match' && (
        <Image 
          source={matchData.image} 
          style={styles.messageAvatar} 
        />
      )}
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userMessage : styles.matchMessage
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        {item.status === 'sending' && (
          <ActivityIndicator size="small" color="#999" style={styles.messageStatus} />
        )}
        {item.status === 'failed' && (
          <TouchableOpacity 
            onPress={() => retryMessage(item)}
            style={styles.retryButton}
          >
            <Ionicons name="reload" size={16} color="red" />
          </TouchableOpacity>
        )}
      </View>
      {item.sender === 'user' && <View style={styles.emptyAvatar} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!wsConnected && (
        <View style={styles.connectionWarning}>
          <Text style={styles.connectionWarningText}>
            正在連接伺服器...
          </Text>
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="發送訊息..."
          placeholderTextColor="#666"
          multiline
          editable={wsConnected}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!message.trim() || !wsConnected || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!message.trim() || !wsConnected || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() && wsConnected ? "#fff" : "#666"} 
            />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  connectionWarning: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    alignItems: 'center',
  },
  connectionWarningText: {
    color: '#856404',
  },
  messageStatus: {
    position: 'absolute',
    right: -20,
    bottom: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#f4511e',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  verifiedBadge: {
    backgroundColor: '#f4511e',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    width: '100%',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  matchMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 20,
    position: 'relative',
  },
  userMessage: {
    backgroundColor: '#f4511e',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  matchMessage: {
    backgroundColor: '#2C2C2E',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
  },
  retryButton: {
    position: 'absolute',
    right: -24,
    bottom: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  emptyAvatar: {
    width: 28,
    marginLeft: 8,
  },
});

export default MatchChatScreen; 