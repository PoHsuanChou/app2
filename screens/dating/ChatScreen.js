import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import WebSocketService from '../../services/websocket';

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();
  
  // 假設這些值從路由參數或登入狀態獲取
  const currentUser = route.params?.currentUser || 'user1';
  const chattingWith = route.params?.chattingWith || 'user2';
  const { matchData, userData } = route.params;

  useEffect(() => {
    // 註冊新消息監聽器
    const handleNewMessage = (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };

    WebSocketService.on('onNewMessage', handleNewMessage);

    // 組件卸載時清理監聽器
    return () => {
      WebSocketService.off('onNewMessage', handleNewMessage);
    };
  }, []);

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
            source={require('../../assets/tarot-ai-avatar.png')}
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

  const sendMessage = async (text) => {
    try {
      await WebSocketService.sendMessage(text);
      
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now(),
        text,
        sender: 'me',
        timestamp: new Date()
      }]);

      // 如果有傳入更新回調函數，則調用它
      if (route.params?.onMessageSent) {
        route.params.onMessageSent();
      }
    } catch (error) {
      console.error('發送消息失敗:', error);
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
      <View style={styles.content}>
        <Text style={styles.text}>Chat with {matchData.name}</Text>
        <Text style={styles.text}>Your name: {userData?.name || 'User'}</Text>
      </View>
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
            onPress={() => sendMessage(inputText)}
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
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
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