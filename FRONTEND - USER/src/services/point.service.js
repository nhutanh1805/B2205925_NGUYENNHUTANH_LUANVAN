import createApiClient from "./api.service";

class PointService {
  constructor(baseUrl = "/api/points") {
    this.api = createApiClient(baseUrl);
  }

  getUserId() {
    const userData = localStorage.getItem("user");
    if (!userData) throw new Error("Chưa đăng nhập");
    return JSON.parse(userData)._id;
  }

  async getBalance() {
    const userId = this.getUserId();
    return (await this.api.post("/balance", { userId })).data;
  }

  async getHistory() {
    const userId = this.getUserId();
    return (await this.api.post("/history", { userId })).data;
  }

  async earnFromOrder(orderId, orderTotal) {
    const userId = this.getUserId();
    return (await this.api.post("/earn", { userId, orderId, orderTotal })).data;
  }

  async redeem(points, note) {
    const userId = this.getUserId();
    return (await this.api.post("/redeem", { userId, points, note })).data;
  }
}

export default new PointService();