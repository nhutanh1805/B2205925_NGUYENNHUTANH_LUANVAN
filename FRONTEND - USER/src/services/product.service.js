// src/services/product.service.js
import createApiClient from "./api.service";

class ProductService {
  constructor(baseUrl = "/api/products") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async deleteAll() {
    return (await this.api.delete("/")).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Bonus: Thống kê theo hãng (nếu bạn có route /thongke/brand)
//   async getStatisticsByBrand() {
//     return (await this.api.get("/thongke/brand")).data;
//   }

//   // Lọc theo hãng, giá, tìm kiếm... (dùng params)
//   async getByFilter(filters = {}) {
//     return (await this.api.get("/", { params: filters })).data;
//   }
}

export default new ProductService();