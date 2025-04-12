/**
 * Message Utilities - Helper functions for message formatting and display
 * 消息工具 - 用於消息格式化和顯示的輔助函數
 */

/**
 * Format timestamp to display time
 * 格式化時間戳顯示時間
 * @param {Date} date - Date object
 * @returns {string} - Formatted time string
 */
export const formatMessageTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Create a new message object
 * 創建新的消息對象
 * @param {string} text - Message text
 * @param {string} sender - Message sender ('user' or 'match')
 * @param {string} [id] - Message ID (optional)
 * @param {string} [status] - Message status (optional)
 * @returns {Object} - Message object
 */
export const createMessage = (text, sender, id = null, status = 'sending') => {
  return {
    id: id || Date.now().toString(),
    text,
    sender,
    timestamp: new Date(),
    status
  };
};

/**
 * Update message status in a message list
 * 在消息列表中更新消息狀態
 * @param {Array} messages - Current messages array
 * @param {string} messageId - ID of message to update
 * @param {string} newStatus - New status value
 * @returns {Array} - Updated messages array
 */
export const updateMessageStatus = (messages, messageId, newStatus) => {
  return messages.map(msg =>
    msg.id === messageId ? { ...msg, status: newStatus } : msg
  );
}; 


/**
 * Create a new message object
 * 創建新的消息對象
 * @param {string} text - Message text
 * @param {string} sender - Message sender ('user' or 'match')
 * @param {string} [id] - Message ID (optional)
 * @param {string} [status] - Message status (optional)
 * @returns {Object} - Message object
 */
export const createMessageForAI = (text,id = null, status = 'sending') => {
  return {
    id: id || Date.now().toString(),
    text,
    timestamp: new Date(),
    isUser: true, // 確保這裡明確設置為 true
    status
  };
};