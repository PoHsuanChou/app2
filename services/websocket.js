import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
let stompClient = null;
const listeners = new Set(); // 初始化 listeners 變量

export const initializeWebSocket = async () => {
  const sock = new SockJS('http://localhost:8080/ws'); // 使用 SockJS 連接
  stompClient = Stomp.over(sock);

  stompClient.connect({}, (frame) => {
    console.log('WebSocket Connected:', frame);
    
    // 在這裡可以訂閱消息
    // stompClient.subscribe('/topic/someTopic', (message) => {
    //   const msg = JSON.parse(message.body);
    //   // 處理接收到的消息
    // });
  }, (error) => {
    console.error('WebSocket Error:', error);
  });

};

export const sendWebSocketMessage = (message) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/private-message',
      body: JSON.stringify(message),
    });
  } else {
    console.error('WebSocket is not connected');
  }
};


export const addMessageListener = (listener) => {
  listeners.add(listener); // 添加監聽器
  return () => listeners.delete(listener); // 返回一個函數以便移除監聽器
};