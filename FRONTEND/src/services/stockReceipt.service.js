import createApiClient from "./api.service";

class StockReceiptService {
  constructor(baseUrl = "/api/stock-receipts") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async getById(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async complete(id) {
    return (await this.api.patch(`/${id}/complete`)).data;
  }

  async cancel(id, reason = "") {
    return (await this.api.patch(`/${id}/cancel`, { reason })).data;
  }
}

export default new StockReceiptService();