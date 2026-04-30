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

  // GET ORDERS
  async getOrders() {
    const userId = this.getUserId();
    return (await this.api.post("/", { userId })).data;
  }

  // GET DETAIL
  async getOrder(orderId) {
    return (await this.api.get(`/${orderId}`)).data;
  }

  // CREATE ORDER
  async createOrder(data) {
    const userId = this.getUserId();

    const payload = {
      userId,
      shippingAddress: data.shippingAddress,
      phone: data.phone,
      note: data.note,
    };

    const res = await this.api.post("/create", payload);
    return res.data;
  }

  // ✅ HỦY / UPDATE STATUS
  async updateOrderStatus(orderId, status) {
  return (
    await this.api.patch(`/${orderId}/status`, {
      status,
    })
  ).data;
}
}

export default new OrderService();