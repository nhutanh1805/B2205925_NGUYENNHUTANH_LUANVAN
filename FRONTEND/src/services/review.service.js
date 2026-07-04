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

  // ===== ADMIN =====

  async adminGetAll(params = {}) {
    return (await this.api.get(`/admin/reviews`, { params })).data;
  }

  async adminGetStats(productId) {
    return (await this.api.get(`/admin/reviews/stats`, { params: { productId } })).data;
  }

  async adminDelete(reviewId) {
    return (await this.api.delete(`/admin/reviews/${reviewId}`, {
      data: { userId: "admin", role: "admin" },
    })).data;
  }

  async adminToggleVisibility(reviewId) {
    return (await this.api.patch(`/admin/reviews/${reviewId}/visibility`)).data;
  }

  async adminReply(reviewId, content, adminId) {
    return (await this.api.post(`/admin/reviews/${reviewId}/reply`, { content, adminId })).data;
  }

  async adminDeleteReply(reviewId) {
    return (await this.api.delete(`/admin/reviews/${reviewId}/reply`)).data;
  }
}

export default new ReviewService();