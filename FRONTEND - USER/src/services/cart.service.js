import createApiClient from "./api.service";

class CartService {
  constructor(baseUrl = "/api/cart") {
    this.api = createApiClient(baseUrl);
  }

  getUserId() {
    const userData = localStorage.getItem("user");
    if (!userData) throw new Error("Chưa đăng nhập");
    const user = JSON.parse(userData);
    return user._id;
  }

  async getCart() {
    const userId = this.getUserId();
    return (await this.api.post("/", { userId })).data;
  }

  async addToCart(productId, quantity = 1) {
    const userId = this.getUserId();
    return (await this.api.post("/add", { userId, productId, quantity })).data;
  }

  async updateQuantity({ productId, quantity }) {
    const userId = this.getUserId();
    return (await this.api.put("/update", { userId, productId, quantity })).data;
  }

  async removeItem(productId) {
    const userId = this.getUserId();
    return (await this.api.delete(`/remove/${productId}`, { data: { userId } })).data;
  }

  async clearCart() {
    const userId = this.getUserId();
    return (await this.api.delete("/clear", { data: { userId } })).data;
  }
}

export default new CartService();