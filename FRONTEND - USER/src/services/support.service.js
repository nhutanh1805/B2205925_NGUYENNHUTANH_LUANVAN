import axios from "axios";

const BASE = "/api/support";

export const SupportAPI = {
  createRequest(userId, payload) {
    return axios.post(BASE, { userId, ...payload });
  },

  getEligibleOrders(userId) {
    return axios.post(`${BASE}/eligible-orders`, { userId });
  },

  getMyRequests(userId) {
    return axios.post(`${BASE}/my`, { userId });
  },

  getRequestDetail(id, userId) {
    return axios.post(`${BASE}/${id}/detail`, { userId });
  },

  sendMessage(id, userId, senderName, content) {
    return axios.post(`${BASE}/${id}/messages`, { userId, senderName, content });
  },
};