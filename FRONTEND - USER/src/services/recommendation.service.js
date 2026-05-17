import createApiClient from "./api.service";

class RecommendationService {
  constructor(baseUrl = "/api/recommendations") {
    this.api = createApiClient(baseUrl);
  }

  async getRecommendations(productId, limit = 4) {
    return (await this.api.get(`/${productId}`, { params: { limit } })).data;
  }
}

export default new RecommendationService();