import createApiClient from "./api.service";

class ShipperService {
  constructor(baseUrl = "/api/shippers") {
    this.api = createApiClient(baseUrl);
  }

  // ── Auth ─────────────────────────────────────────────
  async login({ email, password }) {
    return (await this.api.post("/login", { email, password })).data;
  }

  // ── Admin ─────────────────────────────────────────────
  async createShipper(data) {
    return (await this.api.post("/", data)).data;
  }

  async getAllShippers() {
    return (await this.api.get("/")).data;
  }

  async getShipperById(shipperId) {
    return (await this.api.get(`/${shipperId}`)).data;
  }

  async updateShipperStatus(shipperId, status) {
    return (await this.api.patch(`/${shipperId}/status`, { status })).data;
  }

  // Gán đơn hàng cho shipper (admin gọi)
  async assignOrder(shipperId, orderId) {
    return (await this.api.post(`/${shipperId}/assign`, { orderId })).data;
  }

  // ── Shipper ───────────────────────────────────────────
  // Lấy danh sách đơn của shipper
  async getMyOrders(shipperId, { status = "" } = {}) {
    return (
      await this.api.get(`/${shipperId}/orders`, {
        params: { status },
      })
    ).data;
  }

 // Cập nhật trạng thái đơn (shipper thực hiện)
  async updateOrderStatus(shipperId, orderId, status, reason = "") {
    return (
      await this.api.patch(`/${shipperId}/orders/${orderId}/status`, { status, reason })
    ).data;
  }

  // Thống kê nhanh
  async getStats(shipperId) {
    return (await this.api.get(`/${shipperId}/stats`)).data;
  }
}

export default new ShipperService();