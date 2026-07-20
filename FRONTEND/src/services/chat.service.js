import axios from "axios";

const BASE = "/api/chat";

export const AdminChatAPI = {
  getConversations() {
    return axios.get(`${BASE}/admin/conversations`);
  },

  getMessagesByUser(userId) {
    return axios.get(`${BASE}/admin/${userId}/messages`);
  },

  sendMessage(userId, adminId, adminName, content) {
    return axios.post(`${BASE}/admin/${userId}/messages`, { adminId, adminName, content });
  },
};