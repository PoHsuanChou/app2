/**
 * Match Chat Screen - Chat interface for communicating with matches
 * 配對聊天屏幕 - 與配對用戶溝通的聊天界面
 */
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
  disconnectWebSocket,
  isConnected
} from '../services/websocket';
import {
  subscribeToChatRoom,
  subscribeToChatHistory,
  sendChatMessage,
  getChatRoomId
} from '../services/chatService';
import { formatMessageTime, createMessage, updateMessageStatus } from '../utils/messageUtils';

const MatchChatScreen = ({ route, navigation }) => {
  // 從路由參數獲取配對數據
  const { matchData } = route.params;
  
  // 狀態管理
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  // 用於滾動到最新消息的 ref
  const flatListRef = useRef(null);

  /**
   * 初始化 WebSocket 連接
   */
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

    // 離開屏幕時斷開 WebSocket 連接
    return () => {
      disconnectWebSocket();
    };
  }, []);
  
  /**
   * 獲取用戶信息
   */
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          console.log('userId:', storedUserId);
        } else {
          console.log('No userId found');
        }
      } catch (error) {
        console.error('Error fetching user userId:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserInfo();
  }, []);

  /**
   * 訂閱聊天室和請求聊天歷史
   */
  useEffect(() => {
    // 只有當 WebSocket 已連接並且有 userId 和 matchData.id 時才訂閱
    if (wsConnected && userId && matchData.id) {
      // 訂閱實時聊天消息
      const messageSubscription = subscribeToChatRoom(userId, matchData.id, (newMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // 滾動到最新消息
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
      
      // 訂閱聊天歷史
      const historySubscription = subscribeToChatHistory(userId, matchData.id, (historyMessages) => {
        setMessages(historyMessages);
        
        // 滾動到最新消息
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
      
      // 組件卸載時取消訂閱
      return () => {
        if (messageSubscription) {
          messageSubscription.unsubscribe();
        }
        if (historySubscription) {
          historySubscription.unsubscribe();
        }
      };
    }
  }, [wsConnected, userId, matchData.id]);

  /**
   * 配置導航標題欄
   */
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
            console.log('More options pressed');
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, matchData]);

  /**
   * 發送消息
   */
  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || !wsConnected) return;

    setIsLoading(true);
    
    try {
      // 創建新消息對象
      const newMessage = createMessage(trimmedMessage, 'user');

      // 更新 UI
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage(''); // 清空輸入框

      // 滾動到最新消息
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // 發送消息
      await sendChatMessage(userId, matchData.id, trimmedMessage);

      // 更新消息狀態為已發送
      setMessages(prevMessages =>
        updateMessageStatus(prevMessages, newMessage.id, 'sent')
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // 更新消息狀態為發送失敗
      setMessages(prevMessages =>
        updateMessageStatus(prevMessages, newMessage.id, 'failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 重試發送失敗的消息
   */
  const retryMessage = async (failedMessage) => {
    try {
      // 更新消息狀態為重試中
      setMessages(prevMessages =>
        updateMessageStatus(prevMessages, failedMessage.id, 'sending')
      );

      // 重新發送消息
      await sendChatMessage(userId, matchData.id, failedMessage.text);

      // 更新消息狀態為已發送
      setMessages(prevMessages =>
        updateMessageStatus(prevMessages, failedMessage.id, 'sent')
      );

    } catch (error) {
      console.error('Retry failed:', error);
      
      // 更新消息狀態為發送失敗
      setMessages(prevMessages =>
        updateMessageStatus(prevMessages, failedMessage.id, 'failed')
      );
    }
  };

  /**
   * 渲染單條消息
   */
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
        <Text style={styles.messageTime}>{formatMessageTime(item.timestamp)}</Text>
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
      {/* WebSocket 連接狀態提示 */}
      {!wsConnected && (
        <View style={styles.connectionWarning}>
          <Text style={styles.connectionWarningText}>
            正在連接伺服器...
          </Text>
        </View>
      )}
      
      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      {/* 消息輸入區 */}
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

// 樣式定義
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
  emptyAvatar: {
    width: 28,
    marginLeft: 8,
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
});

export default MatchChatScreen; 