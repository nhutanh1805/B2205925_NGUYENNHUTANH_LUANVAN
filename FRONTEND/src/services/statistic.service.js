import createApiClient from "./api.service";

class StatisticService {
  constructor(baseUrl = "/api/statistics") {
    this.api = createApiClient(baseUrl);
  }

  async getOverview({ from, to } = {}) {
    return (await this.api.get("/overview", { params: { from, to } })).data;
  }

  async getRevenueByPeriod({ from, to, period = "day" } = {}) {
    return (await this.api.get("/revenue", { params: { from, to, period } })).data;
  }

  async getOrdersByPeriod({ from, to, period = "day" } = {}) {
    return (await this.api.get("/orders-by-period", { params: { from, to, period } })).data;
  }

  async getTopCustomers({ from, to, limit = 10 } = {}) {
    return (await this.api.get("/top-customers", { params: { from, to, limit } })).data;
  }

  async getTopCancelCustomers({ from, to, limit = 10 } = {}) {
    return (await this.api.get("/cancel-customers", { params: { from, to, limit } })).data;
  }

  async getTopProducts({ from, to, limit = 10 } = {}) {
    return (await this.api.get("/top-products", { params: { from, to, limit } })).data;
  }

  async getMostCancelledProducts({ from, to, limit = 10 } = {}) {
    return (await this.api.get("/cancelled-products", { params: { from, to, limit } })).data;
  }

  async getOrdersByHour({ from, to } = {}) {
    return (await this.api.get("/orders-by-hour", { params: { from, to } })).data;
  }

  async getOrdersByDayOfWeek({ from, to } = {}) {
    return (await this.api.get("/orders-by-day-of-week", { params: { from, to } })).data;
  }

  async getPaymentMethodStats({ from, to } = {}) {
    return (await this.api.get("/payment-methods", { params: { from, to } })).data;
  }

  async getGrowthComparison({ from, to } = {}) {
    return (await this.api.get("/growth", { params: { from, to } })).data;
  }

  async getStaleOrders({ days = 2 } = {}) {
    return (await this.api.get("/stale-orders", { params: { days } })).data;
  }

  async getOrderAverages({ from, to } = {}) {
    return (await this.api.get("/order-averages", { params: { from, to } })).data;
  }
}

export default new StatisticService();