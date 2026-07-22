const { ObjectId } = require("mongodb");
const { containsBannedWord } = require("../utils/badWords.util");

class ForumService {
  constructor(client) {
    this.Messages = client.db().collection("forum_messages");
  }

  async getMessages(limit = 50) {
    const messages = await this.Messages.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return messages.reverse();
  }

  async getMessagesSince(sinceDate) {
    return this.Messages.find({ createdAt: { $gt: new Date(sinceDate) } })
      .sort({ createdAt: 1 })
      .toArray();
  }

  async createMessage({ userId, userName, content }) {
    // Chặn nội dung có từ cấm trước khi lưu
    if (containsBannedWord(content)) {
      const err = new Error("Nội dung chứa từ ngữ không phù hợp");
      err.isBadWord = true; // đánh dấu để controller biết loại lỗi
      throw err;
    }

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