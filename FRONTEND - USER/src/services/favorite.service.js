import createApiClient from "./api.service";

class FavoriteService {
  constructor(baseUrl = "/api/favorites") {
    this.api = createApiClient(baseUrl);
  }

  async add(userId, productId) {
    return (await this.api.post("/", { userId, productId })).data;
  }

  async remove(userId, productId) {
    return (await this.api.delete(`/user/${userId}/${productId}`)).data;
  }

  async getByUser(userId, params = {}) {
    return (await this.api.get(`/user/${userId}`, { params })).data;
  }

  async removeAllByUser(userId) {
    return (await this.api.delete(`/user/${userId}`)).data;
  }

  async check(userId, productId) {
    return (await this.api.get(`/check/${userId}/${productId}`)).data;
  }

  async countByProduct(productId) {
    return (await this.api.get(`/count/${productId}`)).data;
  }
}

export default new FavoriteService();