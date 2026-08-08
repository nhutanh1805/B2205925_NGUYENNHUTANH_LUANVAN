const { ObjectId } = require("mongodb");
const ProductService    = require("./product.service");
const StockBatchService = require("./stockBatch.service");
const DeliveryService   = require("./delivery.service");

class OrderService {
  constructor(client) {
    this.client          = client;
    this.Order           = client.db().collection("orders");
    this.User            = client.db().collection("users");
    this.productService  = new ProductService(client);
    this.batchService     = new StockBatchService(client);
    this.deliveryService  = new DeliveryService(client);
  }

  // Trừ batch FIFO + trừ stock product
  async _deductItems(items) {
    for (const item of items) {
      const deducted = await this.batchService.deductFIFO(
        item.productId,
        item.quantity
      );

      const totalCost = deducted.reduce((s, d) => s + d.importPrice * d.quantity, 0);
      item.costPrice  = Math.round(totalCost / item.quantity);

      const result = await this.productService.Product.updateOne(
        {
          _id:      new ObjectId(item.productId),
          stock:    { $gte: item.quantity },
          isActive: true,
        },
        {
          $inc: { stock: -item.quantity, sold: item.quantity },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.modifiedCount === 0) {
        throw new Error(`Sản phẩm ${item.name} không đủ số lượng`);
      }
    }
  }

  // Hoàn batch + hoàn stock khi hủy đơn
  async _restoreItems(items) {
    for (const item of items) {
      await this.batchService.restoreFIFO(item.productId, item.quantity);

      await this.productService.Product.updateOne(
        { _id: new ObjectId(item.productId) },
        {
          $inc: { stock: item.quantity, sold: -item.quantity },
          $set: { updatedAt: new Date() },
        }
      );
    }
  }

  async createOrder(orderData) {
    const isCOD = (orderData.paymentMethod || "COD") === "COD";

    let userName = "";
    const user = await this.User.findOne({ _id: new ObjectId(orderData.userId) });
    if (user) userName = user.name;

    const items = orderData.items.map((item) => ({
      productId: item.productId,
      name:      item.name,
      price:     item.price,
      quantity:  item.quantity,
      images:    item.images,
      costPrice: 0,
    }));

    if (isCOD) {
      await this._deductItems(items);
    }

    const order = {
      userId:           orderData.userId,
      userName,
      items,
      totalQuantity:    orderData.totalQuantity,
      originalPrice:    orderData.originalPrice ?? orderData.totalPrice, // giá gốc trước giảm
      discount:         orderData.discount       ?? 0,                   // số tiền giảm
      pointsUsed:       orderData.pointsUsed     ?? 0,                   // điểm đã dùng
      totalPrice:       orderData.totalPrice,                            // giá sau giảm (khách trả)
      shippingAddress:  orderData.shippingAddress,
      phone:            orderData.phone,
      note:             orderData.note,
      paymentMethod:    orderData.paymentMethod || "COD",
      paymentStatus:    isCOD ? "paid" : "unpaid",
      status:           "pending",
      stockDeducted:    isCOD,
      paymentExpiredAt: isCOD ? null : new Date(Date.now() + 15 * 60 * 1000),
      createdAt:        new Date(),
      updatedAt:        new Date(),
    };

    const result = await this.Order.insertOne(order);
    order._id = result.insertedId;
    return order;
  }

  async deductStock(order) {
    const items = order.items.map(i => ({ ...i }));
    await this._deductItems(items);

    await this.Order.updateOne(
      { _id: new ObjectId(order._id) },
      {
        $set: {
          items,
          stockDeducted: true,
          updatedAt:     new Date(),
        },
      }
    );
  }

  async updateStatus(orderId, newStatus) {
    if (!orderId || orderId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(orderId))
      return null;

    const order = await this.findById(orderId);
    if (!order) return null;

    const currentStatus = order.status;

    if (currentStatus === "cancelled" || currentStatus === "completed") {
      throw new Error(`Không thể thay đổi trạng thái từ "${currentStatus}"`);
    }

    const isCOD = order.paymentMethod === "COD";

    // Admin được hủy đơn ở MỌI trạng thái (trừ "cancelled"/"completed" đã bị
    // chặn ở trên vì đó là trạng thái cuối). Nên "cancelled" được thêm vào
    // cuối tất cả các nhánh transition dưới đây.
    const allowedTransitions = isCOD
      ? {
          pending:   ["confirmed", "preparing", "cancelled"],
          confirmed: ["preparing", "cancelled"],
          preparing: ["shipping",  "cancelled"],
          shipping:  ["delivered", "failed", "cancelled"],
          failed:    ["preparing", "cancelled"],
          delivered: ["completed", "cancelled"],
        }
      : {
          pending:   ["paid", "cancelled"],
          paid:      ["preparing", "cancelled"],
          preparing: ["shipping",  "cancelled"],
          shipping:  ["delivered", "failed", "cancelled"],
          failed:    ["preparing", "cancelled"],
          delivered: ["completed", "cancelled"],
        };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Không thể chuyển từ "${currentStatus}" sang "${newStatus}"`);
    }

    if (newStatus === "cancelled" && order.stockDeducted) {
      await this._restoreItems(order.items);
    }

    // Nếu đơn đã gán shipper (có bản ghi delivery đang "assigned"/"shipping"),
    // phải đồng bộ sang "cancelled" khi hủy. Không thì bản ghi delivery kẹt lại
    // ở status cũ, khiến getStatsByShipper() tính nhầm đơn đã hủy vào thống kê
    // của shipper (vì hàm đó đọc từ collection deliveries, không đọc từ orders).
    if (newStatus === "cancelled" && order.shipperId) {
      await this.deliveryService.updateDeliveryStatus(orderId, "cancelled");
    }

    const extraFields = newStatus === "paid" ? { paymentStatus: "paid" } : {};

    await this.Order.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: newStatus, updatedAt: new Date(), ...extraFields } }
    );

    return await this.findById(orderId);
  }

  async getOrdersByUser(userId) {
    const orders = await this.Order.aggregate([
      { $match: { userId } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userInfo" } },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1, userId: 1, items: 1, totalQuantity: 1,
          originalPrice: 1, discount: 1, pointsUsed: 1, totalPrice: 1,
          shippingAddress: 1, phone: 1, note: 1, status: 1,
          paymentMethod: 1, paymentStatus: 1, paymentExpiredAt: 1,
          createdAt: 1, updatedAt: 1,
          shipperId: 1, shipperName: 1, shipperPhone: 1,
          failReason: 1, failedAt: 1,
          userName: { $ifNull: ["$userInfo.name", "$userName"] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]).toArray();
    return orders;
  }

  async getAllOrders({ page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = "desc" } = {}) {
    const pageNum  = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 10, 100);
    const skip     = (pageNum - 1) * limitNum;

    let matchQuery = {};
    if (status && status.trim() !== "") matchQuery.status = status.trim();

    const sort = {};
    sort[sortBy || "createdAt"] = sortOrder === "asc" ? 1 : -1;

    const orders = await this.Order.aggregate([
      { $match: matchQuery },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userInfo" } },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1, userId: 1, items: 1, totalQuantity: 1,
          originalPrice: 1, discount: 1, pointsUsed: 1, totalPrice: 1,
          shippingAddress: 1, phone: 1, note: 1, status: 1,
          paymentMethod: 1, paymentStatus: 1, paymentExpiredAt: 1,
          createdAt: 1, updatedAt: 1,
          shipperId: 1, shipperName: 1, shipperPhone: 1,
          failReason: 1, failedAt: 1,
          userName: { $ifNull: ["$userInfo.name", "$userName"] },
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limitNum },
    ]).toArray();

    const total = await this.Order.countDocuments(matchQuery);

    return {
      data: orders,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    };
  }

  async findById(orderId) {
    if (!orderId || orderId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(orderId))
      return null;

    const orders = await this.Order.aggregate([
      { $match: { _id: new ObjectId(orderId) } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userInfo" } },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1, userId: 1, items: 1, totalQuantity: 1,
          originalPrice: 1, discount: 1, pointsUsed: 1, totalPrice: 1,
          shippingAddress: 1, phone: 1, note: 1, status: 1,
          paymentMethod: 1, paymentStatus: 1, paymentExpiredAt: 1,
          stockDeducted: 1, createdAt: 1, updatedAt: 1,
          shipperId: 1, shipperName: 1, shipperPhone: 1,
          failReason: 1, failedAt: 1,
          userName: { $ifNull: ["$userInfo.name", "$userName"] },
        },
      },
    ]).toArray();

    return orders[0] || null;
  }
}

module.exports = OrderService;