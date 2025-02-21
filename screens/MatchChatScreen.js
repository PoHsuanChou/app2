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
  isConnected 
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
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { id } = JSON.parse(userData);
          setUserId(id);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };

    setup();

    // 設置消息監聽
    const removeListener = addMessageListener((wsMessage) => {
      if (wsMessage.chatRoomId === matchData.id) {
        const newMessage = {
          id: Date.now().toString(),
          text: wsMessage.content,
          sender: wsMessage.senderId === userId ? 'user' : 'match',
          timestamp: new Date(),
          status: 'received'
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // 滾動到最新消息
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => removeListener();
  }, [matchData.id, userId]);

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
      const messagePayload = {
        type: 'CHAT',
        chatRoomId: matchData.id,
        content: trimmedMessage,
        senderId: userId,
        timestamp: new Date().toISOString()
      };

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
        type: 'CHAT',
        chatRoomId: matchData.id,
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

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userMessage : styles.matchMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
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
    marginLeft: 5,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
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
    marginLeft: 5,
    padding: 5,
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