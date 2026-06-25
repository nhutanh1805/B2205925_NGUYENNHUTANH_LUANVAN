const { ObjectId } = require("mongodb");

class SupportService {
  constructor(client) {
    this.Requests = client.db().collection("support_requests");
    this.Messages = client.db().collection("support_messages");
  }

  // YÊU CẦU

  async createRequest(userId, { type, orderId, reason, images = [], selectedProducts = [], userName = "" }) {
    const doc = {
      userId,
      userName,
      type,
      orderId: orderId ? new ObjectId(orderId) : null,
      reason,
      images,
      // Snapshot sản phẩm tại thời điểm gửi yêu cầu
      selectedProducts, // [{ productId, name, image, price, quantity, variantInfo }]
      status: "pending",
      adminNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.Requests.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async getMyRequests(userId) {
    return this.Requests.find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getRequestById(requestId, userId = null) {
    const query = { _id: new ObjectId(requestId) };
    if (userId) query.userId = userId;
    return this.Requests.findOne(query);
  }

  // ADMIN

  async getAllRequests({ status, type, page = 1, limit = 20 }) {
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const skip  = (page - 1) * limit;
    const total = await this.Requests.countDocuments(filter);
    const items = await this.Requests.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(requestId, { status, adminNote }) {
    const result = await this.Requests.findOneAndUpdate(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status,
          adminNote: adminNote ?? null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    return result;
  }

  // TIN NHẮN

  async sendMessage({ requestId, senderId, senderName, role, content }) {
    const doc = {
      requestId: new ObjectId(requestId),
      senderId,
      senderName,
      role,      // "user" | "admin"
      content,
      createdAt: new Date(),
    };
    const result = await this.Messages.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async getMessages(requestId) {
    return this.Messages.find({ requestId: new ObjectId(requestId) })
      .sort({ createdAt: 1 })
      .toArray();
  }
}

module.exports = SupportService;