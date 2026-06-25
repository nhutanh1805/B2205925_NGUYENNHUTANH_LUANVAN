const { ObjectId } = require("mongodb");

class SupportService {
  constructor(client) {
    this.Requests = client.db().collection("support_requests");
    this.Messages = client.db().collection("support_messages");
    this.Orders   = client.db().collection("orders"); // thêm: cần để validate & lấy đơn đủ điều kiện
  }

  // YÊU CẦU

  async createRequest(userId, { type, orderId, reason, images = [], selectedProducts = [], userName = "" }) {
    if (!orderId) {
      throw { status: 400, message: "Thiếu mã đơn hàng" };
    }
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      throw { status: 400, message: "Vui lòng chọn ít nhất 1 sản phẩm" };
    }

    // Lấy đơn hàng thật để đối chiếu, tránh khách gửi sai/giả productId, price, quantity
    const order = await this.Orders.findOne({ _id: new ObjectId(orderId), userId });
    if (!order) {
      throw { status: 404, message: "Đơn hàng không tồn tại hoặc không thuộc về bạn" };
    }
    if (order.status !== "completed") {
      throw { status: 400, message: "Đơn hàng chưa hoàn thành, không thể tạo yêu cầu" };
    }

    // Đối chiếu từng sản phẩm khách chọn với items thật trong order
    const validatedProducts = selectedProducts.map((p) => {
      const item = order.items.find((i) => String(i.productId) === String(p.productId));
      if (!item) {
        throw { status: 400, message: `Sản phẩm "${p.name || p.productId}" không có trong đơn hàng này` };
      }
      const qty = Number(p.quantity) || 1;
      if (qty > item.quantity) {
        throw { status: 400, message: `Số lượng "${item.name}" vượt quá số lượng đã mua` };
      }

      return {
        productId:   String(item.productId),
        name:        item.name,
        image:       Array.isArray(item.images) ? item.images[0] : (item.image || null),
        price:       item.price,
        quantity:    qty, // số lượng khách chọn để đổi trả/bảo hành (có thể < số lượng đã mua)
        variantInfo: item.variantInfo || item.variant || null,
        status:      "pending", // trạng thái xử lý riêng cho từng sản phẩm
      };
    });

    const doc = {
      userId,
      userName,
      type,
      orderId: new ObjectId(orderId),
      reason,
      images,
      // Snapshot sản phẩm đã validate tại thời điểm gửi yêu cầu
      selectedProducts: validatedProducts,
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

  // Lấy danh sách đơn hàng đủ điều kiện tạo yêu cầu (đã hoàn thành)
  async getEligibleOrders(userId) {
    return this.Orders.find({ userId, status: "completed" })
      .sort({ createdAt: -1 })
      .project({ _id: 1, items: 1, totalPrice: 1, createdAt: 1 })
      .toArray();
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