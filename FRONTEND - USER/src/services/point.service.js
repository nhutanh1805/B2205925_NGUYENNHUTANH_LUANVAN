import createApiClient from "./api.service";

const POINT_TO_VND = 100;

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

  async getBatches() {
    const userId = this.getUserId();
    return (await this.api.post("/batches", { userId })).data;
  }

  async earnFromOrder(orderId, orderTotal) {
    const userId = this.getUserId();
    return (await this.api.post("/earn", { userId, orderId, orderTotal })).data;
  }

  async redeem(points, note) {
    const userId = this.getUserId();
    return (await this.api.post("/redeem", { userId, points, note })).data;
  }

  calcRedeem(pointsRequested, userBalance, orderTotal) {
    const maxByOrder = Math.floor((orderTotal * 0.2) / POINT_TO_VND);
    const affordable = Math.min(pointsRequested, userBalance ?? Infinity);
    const capped     = Math.min(affordable, maxByOrder);
    const discount   = capped * POINT_TO_VND;
    return { pointsUsed: capped, discount };
  }
}

export default new PointService();