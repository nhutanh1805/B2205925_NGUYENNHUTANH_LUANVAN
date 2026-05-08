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
}

export default new UserAuthService();