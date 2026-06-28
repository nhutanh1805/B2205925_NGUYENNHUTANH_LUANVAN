const { ObjectId } = require("mongodb");

class DeliveryService {
  constructor(client) {
    this.client   = client;
    this.Delivery = client.db().collection("deliveries");
    this.Shipper  = client.db().collection("shippers");
    this.Order    = client.db().collection("orders");
  }

  // ── Tạo bản ghi giao hàng mới (gọi khi assignOrder) ──
  async createDelivery({ orderId, shipperId, shipperName, shipperPhone }) {
    const delivery = {
      orderId,
      shipperId,
      shipperName,
      shipperPhone,
      status:      "assigned",   // assigned | shipping | delivered | failed
      failReason:  null,
      assignedAt:  new Date(),
      shippingAt:  null,
      deliveredAt: null,
      failedAt:    null,
      updatedAt:   new Date(),
    };
    const result = await this.Delivery.insertOne(delivery);
    delivery._id = result.insertedId;
    return delivery;
  }

  // ── Cập nhật bản ghi delivery đang active của đơn (gọi khi shipper update status) ──
  async updateDeliveryStatus(orderId, newStatus, reason = "") {
    // Lấy bản ghi mới nhất (assigned hoặc shipping) của đơn
    const delivery = await this.Delivery.findOne(
      { orderId, status: { $in: ["assigned", "shipping"] } },
      { sort: { assignedAt: -1 } }
    );
    if (!delivery) return null;

    const setFields = { status: newStatus, updatedAt: new Date() };

    if (newStatus === "shipping")  setFields.shippingAt  = new Date();
    if (newStatus === "delivered") setFields.deliveredAt = new Date();
    if (newStatus === "failed") {
      setFields.failReason = reason || "";
      setFields.failedAt   = new Date();
    }

    await this.Delivery.updateOne(
      { _id: delivery._id },
      { $set: setFields }
    );

    return this.Delivery.findOne({ _id: delivery._id });
  }

  // ── Lấy toàn bộ lịch sử giao hàng của 1 đơn ──
  async getDeliveriesByOrder(orderId) {
    return this.Delivery
      .find({ orderId })
      .sort({ assignedAt: -1 })
      .toArray();
  }

  // ── Lấy danh sách delivery (admin) với filter + pagination ──
  async getAllDeliveries({ page = 1, limit = 10, status, shipperId } = {}) {
    const pageNum  = parseInt(page)  || 1;
    const limitNum = Math.min(parseInt(limit) || 10, 100);
    const skip     = (pageNum - 1) * limitNum;

    const match = {};
    if (status    && status.trim())    match.status    = status.trim();
    if (shipperId && shipperId.trim()) match.shipperId = shipperId.trim();

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from:         "orders",
          localField:   "orderId",
          foreignField: "_id",
          as:           "orderInfo",
          pipeline: [
            { $project: { _id: 1, userId: 1, totalPrice: 1, phone: 1, shippingAddress: 1 } },
          ],
        },
      },
      { $unwind: { path: "$orderInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { assignedAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const [data, total] = await Promise.all([
      this.Delivery.aggregate(pipeline).toArray(),
      this.Delivery.countDocuments(match),
    ]);

    return {
      data,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    };
  }

  // ── Thống kê theo shipper ──
  async getStatsByShipper(shipperId) {
    const [assigned, shipping, delivered, failed] = await Promise.all([
      this.Delivery.countDocuments({ shipperId, status: "assigned"  }),
      this.Delivery.countDocuments({ shipperId, status: "shipping"  }),
      this.Delivery.countDocuments({ shipperId, status: "delivered" }),
      this.Delivery.countDocuments({ shipperId, status: "failed"    }),
    ]);
    return { assigned, shipping, delivered, failed, total: assigned + shipping + delivered + failed };
  }
}

module.exports = DeliveryService;