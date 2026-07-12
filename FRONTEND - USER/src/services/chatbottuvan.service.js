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

// Lấy userId nếu đã đăng nhập, null nếu chưa (KHÔNG throw như PointService,
// vì chatbot vẫn phải hoạt động được cho khách chưa đăng nhập)
function getUserId() {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    try {
        return JSON.parse(userData)._id || null;
    } catch {
        return null;
    }
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
                userId: getUserId(),
            })
        ).data;
    }

    async getHistory() {
        return (
            await this.api.get("/history", {
                params: {
                    sessionId: getSessionId(),
                    userId: getUserId(),
                },
            })
        ).data;
    }

    async clearHistory() {
        return (
            await this.api.delete("/history", {
                params: {
                    sessionId: getSessionId(),
                    userId: getUserId(),
                },
            })
        ).data;
    }
}

export default new ChatbotTuvanService();