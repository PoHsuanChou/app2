// websocketService.js
import { Client } from '@stomp/stompjs';
import { Platform } from 'react-native';

let stompClient = null;
const listeners = new Set();

// 根據環境獲取 WebSocket URL
const getWebSocketUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'ws://10.0.2.2:8080/ws';  // Android 模擬器
    } else {
      return 'ws://localhost:8080/ws';  // iOS 模擬器
    }
  }
  return 'wss://your-production-server.com/ws';  // 生產環境
};

export const initializeWebSocket = () => {
  return new Promise((resolve, reject) => {
    try {
      // 創建新的 STOMP 客戶端
      stompClient = new Client({
        brokerURL: getWebSocketUrl(),
        connectHeaders: {
          // 可以添加認證頭
          // 'Authorization': 'Bearer your-token'
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

export const sendWebSocketMessage = async (message) => {
  return new Promise((resolve, reject) => {
    if (!stompClient?.connected) {
      reject(new Error('WebSocket is not connected'));
      return;
    }

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

export const disconnectWebSocket = () => {
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    stompClient = null;
  }
  listeners.clear();
};

export const addMessageListener = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const isConnected = () => {
  return stompClient?.connected ?? false;
};