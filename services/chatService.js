/**
 * Chat Service - Handles chat-related functionality
 * 提供聊天相關功能的服務層，負責處理聊天訊息的發送和接收
 */
import { 
  sendWebSocketMessage, 
  subscribeToChat, 
  addMessageListener,
  requestChatHistory
} from './websocket';

/**
 * Generate a unique chat room ID from two user IDs
 * 從兩個用戶ID生成唯一的聊天室ID
 * @param {string} userIdA - First user ID
 * @param {string} userIdB - Second user ID
 * @returns {string} - The chat room ID
 */
export const getChatRoomId = (userIdA, userIdB) => {
  return userIdA < userIdB ? `${userIdA}_${userIdB}` : `${userIdB}_${userIdA}`;
};

/**
 * Subscribe to a chat room and receive messages
 * 訂閱聊天室並接收訊息
 * @param {string} userId - Current user's ID
 * @param {string} matchId - Match user's ID
 * @param {Function} onNewMessage - Callback when new message is received
 * @returns {Object} - Subscription object with unsubscribe method
 */
export const subscribeToChatRoom = (userId, matchId, onNewMessage) => {
  const chatRoomId = getChatRoomId(userId, matchId);
  
  const messageSubscription = subscribeToChat(chatRoomId, (message) => {
    const wsMessage = JSON.parse(message.body);
    if (wsMessage.chatRoomId === chatRoomId) {
      const newMessage = {
        id: wsMessage.id || Date.now().toString(),
        text: wsMessage.content,
        sender: wsMessage.senderId === userId ? 'user' : 'match',
        timestamp: new Date(wsMessage.timestamp),
        status: 'received'
      };
      
      onNewMessage(newMessage);
    }
  });
  
  return messageSubscription;
};

/**
 * Subscribe to chat history and fetch past messages
 * 訂閱聊天歷史並獲取過去的訊息
 * @param {string} userId - Current user's ID
 * @param {string} matchId - Match user's ID
 * @param {Function} onHistoryReceived - Callback when history is received
 * @returns {Object} - Subscription object with unsubscribe method
 */
export const subscribeToChatHistory = (userId, matchId, onHistoryReceived) => {
  const chatRoomId = getChatRoomId(userId, matchId);
  
  const historySubscription = addMessageListener(`/user/${userId}/queue/chat-history`, (history) => {
    try {
      const historyMessages = JSON.parse(history.body);
      
      if (Array.isArray(historyMessages)) {
        const formattedMessages = historyMessages.map(msg => ({
          id: msg.id || Date.now().toString(),
          text: msg.content,
          sender: msg.senderId === userId ? 'user' : 'match',
          timestamp: new Date(msg.timestamp),
          status: 'received'
        }));
        
        onHistoryReceived(formattedMessages);
      } else {
        console.warn('Received chat history is not an array:', historyMessages);
      }
    } catch (error) {
      console.error('Error parsing chat history:', error, 'Raw data:', history.body);
    }
  });
  
  // Request the chat history from the server
  requestChatHistory(chatRoomId);
  
  return historySubscription;
};

/**
 * Send a chat message
 * 發送聊天訊息
 * @param {string} userId - Sender's user ID
 * @param {string} receiverId - Receiver's user ID
 * @param {string} content - Message content
 * @returns {Promise} - Resolves when message is sent
 */
export const sendChatMessage = async (userId, receiverId, content) => {
  const chatRoomId = getChatRoomId(userId, receiverId);
  
  const messagePayload = {
    type: 'TEXT',
    chatRoomId: chatRoomId,
    content: content,
    senderId: userId,
    receiverId: receiverId,
    timestamp: new Date().toISOString()
  };
  
  return await sendWebSocketMessage(messagePayload);
}; 