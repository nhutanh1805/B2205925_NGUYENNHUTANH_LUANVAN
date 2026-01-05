import createApiClient from "./api.service";

class OrderService {
  constructor(baseUrl = "/api/orders") {
    this.api = createApiClient(baseUrl);
  }

  async getAllOrders({
    page = 1,
    limit = 10,
    status = "",
    sortBy = "createdAt",
    sortOrder = "desc"
  } = {}) {
    return (
      await this.api.get("/all", {
        params: { page, limit, status, sortBy, sortOrder }
      })
    ).data;
  }

  async getOrder(orderId) {
    return (await this.api.get(`/${orderId}`)).data;
  }

  async updateOrderStatus(orderId, newStatus) {
    return (await this.api.patch(`/${orderId}/status`, { status: newStatus })).data;
  }
}

export default new OrderService();
