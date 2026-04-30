import createApiClient from "./api.service";

class ChatbotService {
  constructor(baseUrl = "/api/chatbot") {
    this.api = createApiClient(baseUrl);
  }

  async ask(message) {
    return (await this.api.post("/ask", { message })).data;
  }
}

export default new ChatbotService();