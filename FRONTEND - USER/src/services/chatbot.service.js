import createApiClient from "./api.service";

// Tạo hoặc lấy sessionId (dùng cho khách chưa đăng nhập)
function getSessionId() {
  let id = localStorage.getItem("chatbot_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chatbot_session_id", id);
  }
  return id;
}

class ChatbotService {
  constructor(baseUrl = "/api/chatbot") {
    this.api = createApiClient(baseUrl);
  }

  async ask(message) {
    return (
      await this.api.post("/ask", {
        message,
        sessionId: getSessionId(), 
      })
    ).data;
  }

  async getHistory() {
    return (
      await this.api.get("/history", {
        params: { sessionId: getSessionId() },
      })
    ).data;
  }

  async clearHistory() {
    return (
      await this.api.delete("/history", {
        params: { sessionId: getSessionId() },
      })
    ).data;
  }
}

export default new ChatbotService();