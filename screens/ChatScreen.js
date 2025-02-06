import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const SOCKET_URL = 'http://localhost:8080/ws';

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const scrollViewRef = useRef();
  
  // 假設這些值從路由參數或登入狀態獲取
  const currentUser = route.params?.currentUser || 'user1';
  const chattingWith = route.params?.chattingWith || 'user2';

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const sock = new SockJS(SOCKET_URL);
    const client = Stomp.over(sock);

    client.connect({}, () => {
      setStompClient(client);
      
      // 訂閱私人訊息
      client.subscribe(`/user/${currentUser}/queue/messages`, (message) => {
        console.log('Received message:', message);
        const newMessage = JSON.parse(message.body);
        addMessage({
          id: Date.now().toString(),
          text: newMessage.content,
          isUser: false,
          timestamp: new Date(),
          sender: newMessage.from
        });
      });

      // 訂閱公開頻道
      client.subscribe('/topic/public', (message) => {
        const newMessage = JSON.parse(message.body);
        // 系統消息可以特別處理
        if (newMessage.type === 'SYSTEM') {
          // 處理系統消息
        }
      });

      // 註冊使用者
      client.send("/app/chat.register", {}, 
        JSON.stringify({
          from: currentUser,
          content: "已加入聊天",
        })
      );
    });
  };

  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

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
            source={require('../assets/tarot-ai-avatar.png')}
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

  const sendMessage = () => {
    if (inputText.trim() === '' || !stompClient) return;

    const messageData = {
      from: currentUser,
      to: chattingWith,
      content: inputText,
      timestamp: new Date().toISOString()
    };

    // 發送訊息到伺服器
    stompClient.send("/app/private-message", {}, JSON.stringify(messageData));

    // 新增訊息到本地顯示
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(newMessage);
    setInputText('');
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
        style={styles.container}
      >
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="輸入訊息..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
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
    backgroundColor: '#121212',
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