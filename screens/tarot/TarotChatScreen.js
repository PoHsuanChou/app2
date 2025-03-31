import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectToWebSocket } from '../../services/websocket';

const TarotChatScreen = ({ route, navigation }) => {
  const { cardId, cardName, isReversed } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [userId, setUserId] = useState(null);
  const ws = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: `${cardName} Reading`,
      headerStyle: {
        backgroundColor: '#1C1C1E',
      },
      headerTintColor: '#ffd700',
    });

    const initializeChat = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);

      // 連接 WebSocket
      const socket = await connectToWebSocket();
      ws.current = socket;

      // 發送初始化消息
      if (socket) {
        socket.send(JSON.stringify({
          type: 'INIT_TAROT_CHAT',
          userId: storedUserId,
          cardId: cardId,
          isReversed: isReversed,
        }));
      }

      // 監聽消息
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'TAROT_MESSAGE') {
          setMessages(prev => [...prev, data.message]);
        }
      };
    };

    initializeChat();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [cardId, cardName, isReversed]);

  const sendMessage = () => {
    if (inputText.trim() && ws.current) {
      const message = {
        type: 'TAROT_MESSAGE',
        userId: userId,
        cardId: cardId,
        content: inputText.trim(),
        timestamp: new Date().toISOString(),
      };

      ws.current.send(JSON.stringify(message));
      setInputText('');
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.userId === userId;

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.botMessage
      ]}>
        {!isUser && (
          <Image
            source={{ uri: imageUrl }} // 請確保添加塔羅牌讀者的頭像
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          <Text style={styles.messageText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your reading..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
        >
          <Ionicons name="send" size={24} color="#ffd700" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
  },
  userBubble: {
    backgroundColor: '#ffd700',
  },
  botBubble: {
    backgroundColor: '#2d2d2d',
  },
  messageText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#2d2d2d',
  },
  input: {
    flex: 1,
    backgroundColor: '#3d3d3d',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3d3d3d',
  },
});

export default TarotChatScreen; 