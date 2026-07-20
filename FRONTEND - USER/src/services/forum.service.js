import axios from "axios";

const BASE = "/api/forum";

export const ForumAPI = {
  getMessages() {
    return axios.get(`${BASE}/messages`);
  },
  getMessagesSince(sinceDate) {
    return axios.get(`${BASE}/messages`, { params: { since: sinceDate } });
  },
  createMessage(userId, userName, content) {
    return axios.post(`${BASE}/messages`, { userId, userName, content });
  },
};