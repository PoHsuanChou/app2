import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initializeWebSocket, 
  disconnectWebSocket,
  isConnected
} from '../../services/websocket';
import {
  subscribeToChatRoomForAI,
  sendChatMessageForAI,
} from '../../services/chatService';
import {createMessageForAI, updateMessageStatus } from '../../utils/messageUtils';

const ChatScreen = ({ navigation, route }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  const flatListRef = useRef(null);

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

  useEffect(() => {
    if (wsConnected && userId) {
      const messageSubscription = subscribeToChatRoomForAI(userId, (newMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      return () => {
        if (messageSubscription) {
          messageSubscription.unsubscribe();
        }
      };
    }
  }, [wsConnected, userId]);

  const renderMessage = ({ item, index }) => {
    const isLastMessage = index === messages.length - 1;
    
    return (
      <Animated.View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userMessage : styles.aiMessage,
          isLastMessage && styles.lastMessage
        ]}
      >
        {!item.isUser && (
          <Image
            source={require('../../assets/logo/chatbot.png')}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageContent,
          item.isUser ? styles.userMessageContent : styles.aiMessageContent
        ]}>
          <Text style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || !wsConnected) return;

    setIsLoading(true);
    
    try {
      const newMessage = createMessageForAI(trimmedMessage);
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      await sendChatMessageForAI(userId, trimmedMessage);
      setMessages(prevMessages =>
        updateMessageStatus(prevMessages, newMessage.id, 'sent')
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prevMessages =>
        updateMessageStatus(prevMessages, newMessage.id, 'failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerButtonText}>返回</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          style={styles.messageListContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="輸入訊息..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage} // 修正：移除多餘的參數
            disabled={!message.trim()}
          >
            <Text style={styles.sendButtonText}>發送</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  keyboardContainer: {
    flex: 1, // 讓 KeyboardAvoidingView 佔滿整個螢幕
  },
  messageListContainer: {
    flexGrow: 1, // 讓 FlatList 填滿可用空間
  },
  messageList: {
    padding: 15,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '80%',
  },
  messageContent: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  userMessageContent: {
    backgroundColor: '#f4511e',
    borderTopRightRadius: 4,
  },
  aiMessageContent: {
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#f4511e',
    borderRadius: 20,
    padding: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessage: {
    marginBottom: 10,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    padding: 5,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 17,
    marginLeft: 5,
  },
});

export default ChatScreen;