import axios from "axios";

const BASE = "/api/support";

export const AdminSupportAPI = {
  getAllRequests({ status, type, page = 1, limit = 20 } = {}) {
    const params = { page, limit };
    if (status) params.status = status;
    if (type)   params.type   = type;
    return axios.get(`${BASE}/admin`, { params });
  },

  getRequestById(id) {
    return axios.get(`${BASE}/admin`, { params: { page: 1, limit: 100 } });
  },

  getMessages(id) {
    return axios.get(`${BASE}/admin/${id}/messages`);
  },

  updateStatus(id, { status, adminNote }) {
    return axios.patch(`${BASE}/admin/${id}/status`, { status, adminNote });
  },

  adminSendMessage(id, senderName, content) {
    return axios.post(`${BASE}/admin/${id}/messages`, { senderName, content });
  },
};