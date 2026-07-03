import createApiClient from "./api.service";

class AdminShipperService {
  constructor(baseUrl = "/api/shippers") {
    this.api = createApiClient(baseUrl);
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  async getById(shipperId) {
    return (await this.api.get(`/${shipperId}`)).data;
  }

  // status: "active" | "inactive"
  async updateStatus(shipperId, status) {
    return (await this.api.patch(`/${shipperId}/status`, { status })).data;
  }

  async getStats(shipperId) {
    return (await this.api.get(`/${shipperId}/stats`)).data;
  }

  async getOrders(shipperId, status) {
    return (await this.api.get(`/${shipperId}/orders`, { params: { status } })).data;
  }
}

export default new AdminShipperService();