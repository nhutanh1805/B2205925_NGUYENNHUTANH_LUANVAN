const { ObjectId } = require("mongodb");
const { containsBannedWord } = require("../utils/badWords.util");

class ChatService {
  constructor(client) {
    this.Messages = client.db().collection("chat_messages");
    this.Users    = client.db().collection("users");   // lấy tên khách hiển thị cho admin
    this.Admins   = client.db().collection("admins");  // lấy tên admin hiển thị (nếu cần double-check)
  }

  // Lấy toàn bộ tin nhắn của 1 cuộc hội thoại (theo userId của khách)
  async getMessages(userId) {
    return this.Messages.find({ userId })
      .sort({ createdAt: 1 })
      .toArray();
  }

  // ADMIN — lấy tên + email của 1 khách để hiển thị header trang chi tiết chat
  async getUserInfo(userId) {
    if (!ObjectId.isValid(userId)) return null;
    const user = await this.Users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { name: 1, email: 1 } }
    );
    if (!user) return null;
    return {
      userId: String(user._id),
      name: user.name || "Khách",
      email: user.email || null,
    };
  }

  // Gửi tin nhắn — userId luôn là chủ cuộc hội thoại (khách hàng)
  // Nếu role = "admin" thì senderId = adminId (bắt buộc), để biết admin nào đã nhắn
  async sendMessage({ userId, senderId, senderName, role, content }) {
    if (containsBannedWord(content)) {
      const err = new Error("Nội dung chứa từ ngữ không phù hợp");
      err.isBadWord = true;
      throw err;
    }

    const doc = {
      userId,                      // id khách hàng - định danh cuộc hội thoại
      senderId: senderId || null,  // userId (nếu role=user) hoặc adminId (nếu role=admin)
      senderName,
      role,                        // "user" | "admin"
      content,
      isRead: role === "admin",    // tin admin gửi -> coi như đã đọc; tin user gửi -> chưa đọc cho tới khi admin xem
      createdAt: new Date(),
    };
    const result = await this.Messages.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  // ADMIN — danh sách hội thoại: group theo userId, lấy tin cuối + đếm chưa đọc + admin đã từng trả lời
  async getConversations() {
    const pipeline = [
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastMessage:   { $first: "$content" },
          lastRole:      { $first: "$role" },
          lastSenderId:  { $first: "$senderId" },
          lastCreatedAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$role", "user"] }, { $eq: ["$isRead", false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { lastCreatedAt: -1 } },
    ];
    const conversations = await this.Messages.aggregate(pipeline).toArray();

    const userIds = conversations.map((c) => c._id).filter((id) => ObjectId.isValid(id));
    const users = await this.Users.find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
      .project({ name: 1, email: 1 })
      .toArray();
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    return conversations.map((c) => ({
      userId: c._id,
      userName: userMap.get(String(c._id))?.name || "Khách",
      userEmail: userMap.get(String(c._id))?.email || null,
      lastMessage: c.lastMessage,
      lastRole: c.lastRole,
      lastSenderId: c.lastSenderId,
      lastCreatedAt: c.lastCreatedAt,
      unreadCount: c.unreadCount,
    }));
  }

  // ADMIN — đánh dấu đã đọc toàn bộ tin "user" của 1 cuộc hội thoại
  async markAsRead(userId) {
    return this.Messages.updateMany(
      { userId, role: "user", isRead: false },
      { $set: { isRead: true } }
    );
  }
}

module.exports = ChatService;