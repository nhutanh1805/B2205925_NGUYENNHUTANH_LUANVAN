const { ObjectId }    = require("mongodb");
const bcrypt          = require("bcryptjs");
const DeliveryService = require("./delivery.service");

class ShipperService {
  constructor(client) {
    this.client          = client;
    this.Shipper         = client.db().collection("shippers");
    this.Order           = client.db().collection("orders");
    this.deliveryService = new DeliveryService(client);
  }

  async createShipper({ name, phone, email, password, vehicle = "" }) {
    const existing = await this.Shipper.findOne({ $or: [{ email }, { phone }] });
    if (existing) throw new Error("Email hoặc số điện thoại đã tồn tại");

    const hashed = await bcrypt.hash(password, 10);
    const shipper = {
      name,
      phone,
      email,
      password: hashed,
      vehicle,
      status:    "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.Shipper.insertOne(shipper);
    shipper._id = result.insertedId;
    const { password: _pw, ...safe } = shipper;
    return safe;
  }

  async login({ email, password }) {
    const shipper = await this.Shipper.findOne({ email });
    if (!shipper) throw new Error("Email không tồn tại");
    if (shipper.status === "inactive") throw new Error("Tài khoản bị vô hiệu hoá");

    const match = await bcrypt.compare(password, shipper.password);
    if (!match) throw new Error("Mật khẩu không đúng");

    const { password: _pw, ...safe } = shipper;
    return safe;
  }

  async getAllShippers() {
    return this.Shipper
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findById(shipperId) {
    if (!shipperId || !/^[0-9a-fA-F]{24}$/.test(shipperId)) return null;
    return this.Shipper.findOne(
      { _id: new ObjectId(shipperId) },
      { projection: { password: 0 } }
    );
  }

  // ── Gán đơn hàng cho shipper + tạo delivery record ──
  async assignOrder(shipperId, orderId) {
    if (!/^[0-9a-fA-F]{24}$/.test(shipperId) || !/^[0-9a-fA-F]{24}$/.test(orderId))
      throw new Error("ID không hợp lệ");

    const shipper = await this.Shipper.findOne({ _id: new ObjectId(shipperId) });
    if (!shipper)                    throw new Error("Shipper không tồn tại");
    if (shipper.status !== "active") throw new Error("Shipper không hoạt động");

    const order = await this.Order.findOne({ _id: new ObjectId(orderId) });
    if (!order) throw new Error("Đơn hàng không tồn tại");

    if (!["preparing", "failed"].includes(order.status))
      throw new Error(`Chỉ có thể gán đơn khi đang ở trạng thái "Chuẩn bị hàng" hoặc "Giao thất bại", hiện tại: "${order.status}"`);

    const updateFields = {
      shipperId:    shipperId,
      shipperName:  shipper.name,
      shipperPhone: shipper.phone,
      updatedAt:    new Date(),
    };
    if (order.status === "failed") {
      updateFields.status = "preparing";
    }

    await this.Order.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateFields }
    );

    // ── Tạo delivery record mới (mỗi lần gán = 1 bản ghi, lưu lịch sử) ──
    await this.deliveryService.createDelivery({
      orderId:      orderId,
      shipperId:    shipperId,
      shipperName:  shipper.name,
      shipperPhone: shipper.phone,
    });

    return this.Order.findOne({ _id: new ObjectId(orderId) });
  }

  async getOrdersByShipper(shipperId, { status } = {}) {
    const match = { shipperId };
    if (status && status.trim()) match.status = status.trim();

    return this.Order
      .find(match)
      .sort({ updatedAt: -1 })
      .toArray();
  }

  // ── Shipper cập nhật trạng thái đơn + đồng bộ delivery record ──
  async updateOrderStatus(shipperId, orderId, newStatus, reason = "") {
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) throw new Error("orderId không hợp lệ");

    const order = await this.Order.findOne({ _id: new ObjectId(orderId) });
    if (!order)                        throw new Error("Đơn hàng không tồn tại");
    if (order.shipperId !== shipperId) throw new Error("Đơn này không thuộc về bạn");

    const allowed = {
      confirmed: ["shipping"],
      paid:      ["shipping"],
      preparing: ["shipping"],
      shipping:  ["delivered", "failed"],
    };

    if (!allowed[order.status]?.includes(newStatus))
      throw new Error(`Không thể chuyển từ "${order.status}" sang "${newStatus}"`);

    if (newStatus === "failed" && !reason.trim())
      throw new Error("Vui lòng chọn lý do giao hàng thất bại");

    const updateFields = { status: newStatus, updatedAt: new Date() };
    if (newStatus === "failed") {
      updateFields.failReason = reason.trim();
      updateFields.failedAt   = new Date();
    }

    await this.Order.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateFields }
    );

    // ── Đồng bộ delivery record ──
    await this.deliveryService.updateDeliveryStatus(orderId, newStatus, reason);

    return await this.Order.findOne({ _id: new ObjectId(orderId) });
  }

  // ── Thống kê giao hàng của shipper: lấy từ collection deliveries ──
  // (chuẩn hơn đếm trên orders, vì orders.shipperId bị ghi đè mỗi lần gán lại
  //  cho shipper khác nên sẽ mất lịch sử của shipper cũ)
  async getStats(shipperId) {
    return this.deliveryService.getStatsByShipper(shipperId);
  }

  async updateShipperStatus(shipperId, status) {
    if (!["active", "inactive"].includes(status)) throw new Error("Status không hợp lệ");
    if (!/^[0-9a-fA-F]{24}$/.test(shipperId))    throw new Error("ID không hợp lệ");

    await this.Shipper.updateOne(
      { _id: new ObjectId(shipperId) },
      { $set: { status, updatedAt: new Date() } }
    );
    return this.findById(shipperId);
  }
}

module.exports = ShipperService;