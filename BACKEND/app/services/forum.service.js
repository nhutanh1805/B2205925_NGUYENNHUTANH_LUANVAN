const { ObjectId } = require("mongodb");

class ForumService {
  constructor(client) {
    this.Messages = client.db().collection("forum_messages");
  }

  // Lấy tin nhắn mới nhất (mặc định 50 tin gần nhất, sắp cũ -> mới)
  async getMessages(limit = 50) {
    const messages = await this.Messages.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return messages.reverse(); // đảo lại để hiển thị cũ -> mới
  }

  // Lấy tin nhắn mới hơn 1 thời điểm nào đó (dùng cho polling, đỡ phải kéo lại toàn bộ)
  async getMessagesSince(sinceDate) {
    return this.Messages.find({ createdAt: { $gt: new Date(sinceDate) } })
      .sort({ createdAt: 1 })
      .toArray();
  }

  async createMessage({ userId, userName, content }) {
    const doc = {
      userId,
      userName,
      content,
      createdAt: new Date(),
    };
    const result = await this.Messages.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }
}

module.exports = ForumService;