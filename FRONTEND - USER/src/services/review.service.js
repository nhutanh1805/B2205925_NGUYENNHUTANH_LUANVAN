import createApiClient from "./api.service";

class ReviewService {
  constructor(baseUrl = "http://localhost:3000/api") {
    this.api = createApiClient(baseUrl);
  }

  async getByProduct(productId, params = {}) {
    return (await this.api.get(`/products/${productId}/reviews`, { params })).data;
  }

  async getRatingSummary(productId) {
    return (await this.api.get(`/products/${productId}/reviews/rating-summary`)).data;
  }

  async create(productId, data) {
    return (await this.api.post(`/products/${productId}/reviews`, data)).data;
  }

  async update(productId, reviewId, data) {
    return (await this.api.put(`/products/${productId}/reviews/${reviewId}`, data)).data;
  }

  async delete(productId, reviewId, userId) {
    return (await this.api.delete(`/products/${productId}/reviews/${reviewId}`, {
      data: { userId },
    })).data;
  }

  async toggleHelpful(productId, reviewId, userId) {
    return (await this.api.post(`/products/${productId}/reviews/${reviewId}/helpful`, {
      userId,
    })).data;
  }
}

export default new ReviewService();