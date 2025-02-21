import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendWebSocketMessage, addMessageListener } from '../services/websocket';

const MatchChatScreen = ({ route, navigation }) => {
  const { matchData } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // 獲取當前用戶ID
    const getUserId = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { id } = JSON.parse(userData);
        setUserId(id);
      }
    };
    getUserId();

    // 添加 WebSocket 消息監聽器
    const removeListener = addMessageListener((wsMessage) => {
      if (wsMessage.chatRoomId === matchData.id) {
        setMessages(prevMessages => [...prevMessages, {
          id: Date.now().toString(),
          text: wsMessage.content,
          sender: wsMessage.senderId === userId ? 'user' : 'match',
          timestamp: new Date(),
        }]);
      }
    });

    // 清理監聽器
    return () => removeListener();
  }, [matchData.id, userId]);

  // 設置標題欄
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('UserProfile', { userData: matchData })}
        >
          <View style={styles.headerTitle}>
            <Image 
              source={matchData.image} 
              style={styles.headerAvatar} 
            />
            <Text style={styles.headerName}>{matchData.name}</Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, matchData]);

  const sendMessage = () => {
    console.log('sendMessage:', message);
    if (message.trim()) {
      // 先更新UI
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      console.log('newMessage1:', newMessage);
      // 發送到WebSocket
      sendWebSocketMessage({
        type: 'CHAT',
        chatRoomId: matchData.id,
        content: message.trim(),
        timestamp: new Date().toISOString()
      });

      // 清空輸入框
      setMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userMessage : styles.matchMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
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
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={24} color={message.trim() ? "#fff" : "#666"} />
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