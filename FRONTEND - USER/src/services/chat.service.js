import axios from "axios";

const BASE = "/api/chat";

export const ChatAPI = {
  getMyMessages(userId) {
    return axios.post(`${BASE}/messages`, { userId });
  },

  sendMessage(userId, senderName, content) {
    return axios.post(`${BASE}/send`, { userId, senderName, content });
  },
};