import createApiClient from "./api.service";

const POINT_TO_VND = 100;         // 1 điểm = 100₫
const MAX_REDEEM_PER_ORDER = 5000; // tối đa 5.000 điểm/đơn = 500.000₫

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

  // Tính preview giảm giá từ số điểm nhập
  calcRedeem(pointsRequested, userBalance) {
    const affordable = Math.min(pointsRequested, userBalance ?? Infinity);
    const capped     = Math.min(affordable, MAX_REDEEM_PER_ORDER);
    const discount   = capped * POINT_TO_VND;
    return { pointsUsed: capped, discount };
  }

  // Số điểm tối đa có thể dùng cho 1 đơn
  get maxRedeemPerOrder() {
    return MAX_REDEEM_PER_ORDER;
  }
}

export default new PointService();