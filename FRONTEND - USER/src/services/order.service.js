import createApiClient from "./api.service";

class OrderService {
  constructor(baseUrl = "/api/orders") {
    this.api = createApiClient(baseUrl);
  }

  getUserId() {
    const user = localStorage.getItem("user");
    if (!user) throw new Error("Chưa đăng nhập");
    return JSON.parse(user)._id;
  }

  // Lấy danh sách đơn hàng của user
  async getOrders() {
    const userId = this.getUserId();
    return (await this.api.post("/", { userId })).data;
  }

  // Lấy chi tiết đơn hàng
  async getOrder(orderId) {
    return (await this.api.get(`/${orderId}`)).data;
  }

  // Tạo đơn hàng — truyền items đã chọn từ giỏ hàng
  async createOrder(data) {
    const userId = this.getUserId();

    const payload = {
      userId,
      shippingAddress: data.shippingAddress,
      phone: data.phone,
      note: data.note || "",
      paymentMethod: data.paymentMethod || "COD",
      items: data.items, // ← Danh sách sản phẩm đã chọn từ Cart.vue
    };

    const res = await this.api.post("/create", payload);
    return res.data;
  }

  // Hủy / cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status) {
    return (
      await this.api.patch(`/${orderId}/status`, { status })
    ).data;
  }
}

export default new OrderService();