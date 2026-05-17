class ChatHistoryService {
  constructor(client) {
    this.ChatHistory = client.db().collection("chat_histories");
  }

  // Lấy N tin nhắn gần nhất để truyền context cho AI
  async getRecentMessages(userId, sessionId, limit = 20) {
    const query = userId ? { userId } : { sessionId, userId: null };
    const session = await this.ChatHistory.findOne(query);
    if (!session?.messages?.length) return [];
    return session.messages.slice(-limit);
  }

  // Lưu cặp tin nhắn user + bot vào DB
  async appendMessages(userId, sessionId, userMessage, botReply) {
    const query = userId ? { userId } : { sessionId, userId: null };
    const now = new Date();
    await this.ChatHistory.updateOne(
      query,
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: userMessage, createdAt: now },
              { role: "bot",  content: botReply,    createdAt: now },
            ],
          },
        },
        $set:      { updatedAt: now },
        $setOnInsert: {
          userId:    userId || null,
          sessionId: userId ? null : sessionId,
          createdAt: now,
        },
      },
      { upsert: true }
    );
  }

  // Lấy toàn bộ lịch sử
  async getFullHistory(userId, sessionId) {
    const query = userId ? { userId } : { sessionId, userId: null };
    const session = await this.ChatHistory.findOne(query);
    return session?.messages || [];
  }

  // Xoá lịch sử
  async clearHistory(userId, sessionId) {
    const query = userId ? { userId } : { sessionId, userId: null };
    await this.ChatHistory.updateOne(
      query,
      { $set: { messages: [], updatedAt: new Date() } }
    );
  }
}

module.exports = ChatHistoryService;