import createApiClient from "./api.service";

// Tạo hoặc lấy sessionId riêng cho chatbottuvan
function getSessionId() {
    let id = localStorage.getItem("chatbottuvan_session_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("chatbottuvan_session_id", id);
    }
    return id;
}

class ChatbotTuvanService {
    constructor(baseUrl = "/api/chatbottuvan") {
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

export default new ChatbotTuvanService();