const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class ShipperService {
  constructor(client) {
    this.client  = client;
    this.Shipper = client.db().collection("shippers");
    this.Order   = client.db().collection("orders");
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

  // gán đơn hàng cho shipper
  async assignOrder(shipperId, orderId) {
    if (!/^[0-9a-fA-F]{24}$/.test(shipperId) || !/^[0-9a-fA-F]{24}$/.test(orderId))
      throw new Error("ID không hợp lệ");

    const shipper = await this.Shipper.findOne({ _id: new ObjectId(shipperId) });
    if (!shipper)              throw new Error("Shipper không tồn tại");
    if (shipper.status !== "active") throw new Error("Shipper không hoạt động");

    const order = await this.Order.findOne({ _id: new ObjectId(orderId) });
    if (!order) throw new Error("Đơn hàng không tồn tại");

// Gán được khi đơn đang "Chuẩn bị hàng" hoặc đang "Giao thất bại" (gán lại shipper khác)
    if (!["preparing", "failed"].includes(order.status))
      throw new Error(`Chỉ có thể gán đơn khi đang ở trạng thái "Chuẩn bị hàng" hoặc "Giao thất bại", hiện tại: "${order.status}"`);

 const updateFields = {
      shipperId:    shipperId,
      shipperName:  shipper.name,
      shipperPhone: shipper.phone,
      updatedAt:    new Date(),
    };
    // Nếu đơn đang ở trạng thái giao thất bại, chuyển về "preparing" để giao lại từ đầu
    if (order.status === "failed") {
      updateFields.status = "preparing";
    }

    await this.Order.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateFields }
    );

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

    return await this.Order.findOne({ _id: new ObjectId(orderId) });
  }

  async getStats(shipperId) {
    const [preparing, shipping, delivered] = await Promise.all([
      this.Order.countDocuments({ shipperId, status: "preparing" }),
      this.Order.countDocuments({ shipperId, status: "shipping"  }),
      this.Order.countDocuments({ shipperId, status: "delivered" }),
    ]);
    return { preparing, shipping, delivered };
  }

  async updateShipperStatus(shipperId, status) {
    if (!["active", "inactive"].includes(status)) throw new Error("Status không hợp lệ");
    if (!/^[0-9a-fA-F]{24}$/.test(shipperId)) throw new Error("ID không hợp lệ");

    await this.Shipper.updateOne(
      { _id: new ObjectId(shipperId) },
      { $set: { status, updatedAt: new Date() } }
    );
    return this.findById(shipperId);
  }
}

module.exports = ShipperService;