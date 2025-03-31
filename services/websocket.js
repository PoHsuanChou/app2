/**
 * WebSocket Service - Handles all WebSocket connections and messaging
 * WebSocket 服務 - 處理所有 WebSocket 連接和消息傳遞
 */
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 存儲 STOMP 客戶端實例
let stompClient = null;
// 存儲消息監聽器
const listeners = new Set();
// 存儲特定目的地的訂閱
const subscriptions = new Map();

class WebSocketService {
  constructor() {
    this.callbacks = new Map();
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket('YOUR_WEBSOCKET_URL');
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 當收到新消息時，觸發註冊的回調
      if (data.type === 'new_message') {
        this.callbacks.get('onNewMessage')?.forEach(callback => callback(data.message));
      }
    };
  }

  // 註冊消息監聽器
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event).add(callback);
  }

  // 移除消息監聽器
  off(event, callback) {
    this.callbacks.get(event)?.delete(callback);
  }
}

export default new WebSocketService();

/**
 * Get the appropriate WebSocket URL based on environment
 * 根據環境獲取適當的 WebSocket URL
 * @returns {string} - WebSocket URL
 */
const getWebSocketUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/ws';  // Android 模擬器
    } else {
      return 'http://localhost:8080/ws';  // iOS 模擬器
    }
  }
  return 'https://your-production-server.com/ws';  // 生產環境
};

/**
 * Initialize the WebSocket connection
 * 初始化 WebSocket 連接
 * @returns {Promise} - Resolves when connected
 */
export const initializeWebSocket = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // 從 AsyncStorage 獲取 token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found');
      }
      
      const socket = new SockJS(getWebSocketUrl());
      socket.onopen = () => {
        console.log('SockJS connection opened');
      };
      socket.onclose = (event) => {
        console.log('SockJS connection closed', event);
      };
      socket.onerror = (error) => {
        console.error('SockJS error:', error);
      };
      
      stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          // 添加認證頭
          'Authorization': token ? `Bearer ${token}` : ''
        },
        debug: function (str) {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      // 連接成功的回調
      stompClient.onConnect = (frame) => {
        console.log('Connected to WebSocket');
        
        // 訂閱消息
        stompClient.subscribe('/user/queue/messages', (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            listeners.forEach(listener => listener(receivedMessage));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        resolve(frame);
      };

      // 連接錯誤的回調
      stompClient.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        reject(frame);
      };

      // 開始連接
      stompClient.activate();

    } catch (error) {
      console.error('WebSocket setup error:', error);
      reject(error);
    }
  });
};

/**
 * Send a message through WebSocket
 * 通過 WebSocket 發送消息
 * @param {Object} message - Message to send
 * @returns {Promise} - Resolves when message is sent
 */
export const sendWebSocketMessage = async (message) => {
  return new Promise((resolve, reject) => {
    if (!stompClient?.connected) {
      reject(new Error('WebSocket is not connected'));
      return;
    }
    console.log('message:', message);

    try {
      stompClient.publish({
        destination: '/app/private-message',
        body: JSON.stringify(message),
        headers: { 'content-type': 'application/json' }
      });
      resolve(true);
    } catch (error) {
      console.error('Send message error:', error);
      reject(error);
    }
  });
};

/**
 * Disconnect from WebSocket
 * 斷開 WebSocket 連接
 */
export const disconnectWebSocket = () => {
  if (stompClient) {
    try {
      // 取消所有特定目的地的訂閱
      subscriptions.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
      subscriptions.clear();
      
      stompClient.deactivate();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    stompClient = null;
  }
  listeners.clear();
};

/**
 * Add a message listener or subscribe to a specific destination
 * 添加消息監聽器或訂閱特定目的地
 * @param {string|Function} destination - Destination path or listener function
 * @param {Function} callback - Callback function
 * @returns {Function|Object} - Unsubscribe function or subscription object
 */
export const addMessageListener = (destination, callback) => {
  if (!isConnected()) {
    console.error('WebSocket not connected');
    return null;
  }
  
  if (typeof destination === 'function') {
    // 舊的行為，添加一般的消息監聽器
    listeners.add(destination);
    return () => listeners.delete(destination);
  } else {
    // 新的行為，訂閱特定目的地
    console.log(`Subscribing to: ${destination}`);
    const subscription = stompClient.subscribe(destination, callback);
    
    // 儲存訂閱以便後續管理
    subscriptions.set(destination, subscription);
    
    // 返回取消訂閱的函數
    return subscription;
  }
};

/**
 * Check if WebSocket is connected
 * 檢查 WebSocket 是否已連接
 * @returns {boolean} - True if connected
 */
export const isConnected = () => {
  return stompClient?.connected ?? false;
};

/**
 * Subscribe to a chat room
 * 訂閱聊天室
 * @param {string} chatRoomId - Chat room ID
 * @param {Function} onMessageReceived - Callback when message is received
 * @returns {Object} - Subscription object
 */
export const subscribeToChat = (chatRoomId, onMessageReceived) => {
  if (!isConnected()) {
    console.error('WebSocket not connected');
    return null;
  }
  
  console.log(`Subscribing to chat room: ${chatRoomId}`);
  const subscription = stompClient.subscribe(
    `/topic/chat/${chatRoomId}`, 
    onMessageReceived
  );
  
  return subscription;
};

/**
 * Request chat history for a chat room
 * 請求聊天室的聊天歷史
 * @param {string} chatRoomId - Chat room ID
 * @returns {boolean} - True if request was sent
 */
export const requestChatHistory = (chatRoomId) => {
  if (!isConnected()) {
    console.error('WebSocket not connected');
    return false;
  }
  
  console.log(`Requesting chat history for room: ${chatRoomId}`);
  stompClient.publish({
    destination: "/app/get-chat-history",
    body: chatRoomId,
    headers: { 'content-type': 'text/plain' }
  });
  
  return true;
};

export const connectToWebSocket = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return ws;
  } catch (error) {
    console.error('WebSocket Connection Error:', error);
    return null;
  }
};