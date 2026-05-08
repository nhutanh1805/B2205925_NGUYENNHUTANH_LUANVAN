import createApiClient from "./api.service";

class UserAuthService {
  constructor(baseUrl = "/api/users") {
    this.api = createApiClient(baseUrl);
  }

  async findAll() {
    return (await this.api.get("/")).data;
  }

  async deleteUser(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  async updateProfile(id, data) {
    return (await this.api.put(`/profile/${id}`, data)).data.data;
  }

  // Vô hiệu hóa vĩnh viễn
  async deactivateUser(id) {
    return (await this.api.patch(`/deactivate/${id}`)).data;
  }

  // Cấm tài khoản
  async banUser(id) {
    return (await this.api.patch(`/ban/${id}`)).data;
  }

  // Bỏ cấm tài khoản
  async unbanUser(id) {
    return (await this.api.patch(`/unban/${id}`)).data;
  }
}

export default new UserAuthService();