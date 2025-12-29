import createApiClient from "./api.service";

class UserAuthService {
  constructor(baseUrl = "/api/users") {
    this.api = createApiClient(baseUrl);
  }

  async register(data) {
    return (await this.api.post("/register", data)).data;
  }

  async login(data) {
    return (await this.api.post("/login", data)).data;
  }
}

export default new UserAuthService();
