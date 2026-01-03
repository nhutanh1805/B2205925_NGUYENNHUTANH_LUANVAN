import createApiClient from "./api.service";

class OrderService {
  constructor(baseUrl = "/api/orders") {
    this.api = createApiClient(baseUrl);
  }

  getUserId() {
    const userData = localStorage.getItem("user");
    if (!userData) throw new Error("Chưa đăng nhập");
    const user = JSON.parse(userData);
    return user._id;
  }

  async getOrders() {
    const userId = this.getUserId();
    return (await this.api.post("/", { userId })).data;
  }

  async getOrder(orderId) {
    return (await this.api.get(`/${orderId}`)).data;
  }

  async createOrder(orderData) {
    const userId = this.getUserId();
    return (await this.api.post("/create", { ...orderData, userId })).data;
  }

  async updateOrderStatus(orderId, newStatus) {
    return (await this.api.patch(`/${orderId}/status`, { status: newStatus })).data;
  }
}

export default new OrderService();