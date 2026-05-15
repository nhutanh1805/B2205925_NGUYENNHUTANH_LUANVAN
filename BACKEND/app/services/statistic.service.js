const { ObjectId } = require("mongodb");

class StatisticService {
  constructor(client) {
    this.client = client;
    this.Order = client.db().collection("orders");
    this.User  = client.db().collection("users");
  }

  _buildDateFilter(from, to, field = "createdAt") {
    const filter = {};
    if (from || to) {
      filter[field] = {};
      if (from) filter[field].$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter[field].$lte = toDate;
      }
    }
    return filter;
  }

  // GROUP BY (ngày/tuần/tháng/năm)

  _buildGroupByDate(period = "day") {
    const map = {
      day:   { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
      week:  { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } },
      month: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      year:  { year: { $year: "$createdAt" } },
    };
    return map[period] || map.day;
  }

  // 1. TỔNG QUAN (KPIs)

  async getOverview({ from, to } = {}) {
    const dateFilter = this._buildDateFilter(from, to);
    const matchDelivered = { ...dateFilter, status: "delivered" };
    const matchAll       = { ...dateFilter };

    const [revenueData, orderData, customerData, cancelData] = await Promise.all([
      // Doanh thu từ đơn delivered
      this.Order.aggregate([
        { $match: matchDelivered },
        { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      ]).toArray(),

      // Tất cả đơn
      this.Order.aggregate([
        { $match: matchAll },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]).toArray(),

      // Khách hàng đặt trong khoảng
      this.Order.distinct("userId", matchAll),

      // Đơn huỷ
      this.Order.countDocuments({ ...dateFilter, status: "cancelled" }),
    ]);

    const totalRevenue  = revenueData[0]?.total  || 0;
    const totalDelivered= revenueData[0]?.count  || 0;
    const totalOrders   = orderData.reduce((s, o) => s + o.count, 0);
    const aov           = totalDelivered > 0 ? Math.round(totalRevenue / totalDelivered) : 0;
    const cancelRate    = totalOrders > 0 ? Math.round((cancelData / totalOrders) * 100) : 0;

    const byStatus = {};
    orderData.forEach(o => { byStatus[o._id] = o.count; });

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: customerData.length,
      averageOrderValue: aov,
      cancelRate,
      byStatus,
    };
  }

  // 2. DOANH THU THEO THỜI GIAN

  async getRevenueByPeriod({ from, to, period = "day" } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: { ...dateFilter, status: "delivered" } },
      {
        $group: {
          _id: this._buildGroupByDate(period),
          revenue:  { $sum: "$totalPrice" },
          orders:   { $sum: 1 },
          cod:      { $sum: { $cond: [{ $eq: ["$paymentMethod", "COD"] },   "$totalPrice", 0] } },
          vnpay:    { $sum: { $cond: [{ $eq: ["$paymentMethod", "VNPAY"] }, "$totalPrice", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]).toArray();

    return data;
  }

  // 3. ĐƠN HÀNG THEO THỜI GIAN

  async getOrdersByPeriod({ from, to, period = "day" } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id:       this._buildGroupByDate(period),
          total:     { $sum: 1 },
          pending:   { $sum: { $cond: [{ $eq: ["$status", "pending"] },   1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          paid:      { $sum: { $cond: [{ $eq: ["$status", "paid"] },      1, 0] } },
          shipping:  { $sum: { $cond: [{ $eq: ["$status", "shipping"] },  1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]).toArray();

    return data;
  }

  // 4. TOP KHÁCH HÀNG

  async getTopCustomers({ from, to, limit = 10 } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id:        "$userId",
          totalSpent: { $sum: "$totalPrice" },
          totalOrders:{ $sum: 1 },
          userName:   { $first: "$userName" },
          lastOrder:  { $max: "$createdAt" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: Number(limit) },
    ]).toArray();

    return data;
  }

  // 5. KHÁCH HAY HUỶ ĐƠN

  async getTopCancelCustomers({ from, to, limit = 10 } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: { ...dateFilter, status: "cancelled" } },
      {
        $group: {
          _id:          "$userId",
          cancelCount:  { $sum: 1 },
          userName:     { $first: "$userName" },
        },
      },
      { $sort: { cancelCount: -1 } },
      { $limit: Number(limit) },
    ]).toArray();

    return data;
  }


  // 6. SẢN PHẨM BÁN CHẠY

  async getTopProducts({ from, to, limit = 10 } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: { ...dateFilter, status: "delivered" } },
      { $unwind: "$items" },
      {
        $group: {
          _id:       "$items.productId",
          name:      { $first: "$items.name" },
          quantity:  { $sum: "$items.quantity" },
          revenue:   { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orders:    { $sum: 1 },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: Number(limit) },
    ]).toArray();

    return data;
  }

  // 7. SẢN PHẨM HAY BỊ HUỶ

  async getMostCancelledProducts({ from, to, limit = 10 } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: { ...dateFilter, status: "cancelled" } },
      { $unwind: "$items" },
      {
        $group: {
          _id:         "$items.productId",
          name:        { $first: "$items.name" },
          cancelCount: { $sum: "$items.quantity" },
        },
      },
      { $sort: { cancelCount: -1 } },
      { $limit: Number(limit) },
    ]).toArray();

    return data;
  }

  // 8. KHUNG GIỜ ĐẶT HÀNG NHIỀU NHẤT bỎ KO XÀI NỮA

  async getOrdersByHour({ from, to } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id:   { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    // Fill đủ 24h
    const result = Array.from({ length: 24 }, (_, h) => ({
      hour:  h,
      count: data.find(d => d._id === h)?.count || 0,
    }));

    return result;
  }

  // 9. NGÀY TRONG TUẦN BÁN CHẠY

  async getOrdersByDayOfWeek({ from, to } = {}) {
    const dateFilter = this._buildDateFilter(from, to);
    const dayNames   = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    const data = await this.Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id:   { $dayOfWeek: "$createdAt" }, // 1=CN, 2=T2,...
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$totalPrice", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    const result = Array.from({ length: 7 }, (_, i) => ({
      day:     dayNames[i],
      count:   data.find(d => d._id === i + 1)?.count   || 0,
      revenue: data.find(d => d._id === i + 1)?.revenue || 0,
    }));

    return result;
  }

  // 10. COD VS VNPAY

  async getPaymentMethodStats({ from, to } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id:     "$paymentMethod",
          count:   { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$totalPrice", 0] } },
        },
      },
    ]).toArray();

    return data;
  }

  // 11. TĂNG TRƯỞNG SO SÁNH KỲ TRƯỚC

  async getGrowthComparison({ from, to } = {}) {
    if (!from || !to) return null;

    const current = { from, to };

    // Tính khoảng thời gian để so sánh kỳ trước tương đương
    const diff     = new Date(to) - new Date(from);
    const prevTo   = new Date(new Date(from) - 1);
    const prevFrom = new Date(prevTo - diff);

    const prev = {
      from: prevFrom.toISOString().split("T")[0],
      to:   prevTo.toISOString().split("T")[0],
    };

    const [currData, prevData] = await Promise.all([
      this.getOverview(current),
      this.getOverview(prev),
    ]);

    const calcGrowth = (curr, prev) =>
      prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;

    return {
      current: currData,
      previous: prevData,
      growth: {
        revenue: calcGrowth(currData.totalRevenue,   prevData.totalRevenue),
        orders:  calcGrowth(currData.totalOrders,    prevData.totalOrders),
        customers: calcGrowth(currData.totalCustomers, prevData.totalCustomers),
      },
    };
  }

  // 12. ĐƠN CHỜ XỬ LÝ QUÁ LÂU (> 2 ngày)

  async getStaleOrders({ days = 2 } = {}) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - Number(days));

    const data = await this.Order.find({
      status: { $in: ["pending", "confirmed"] },
      createdAt: { $lte: threshold },
    })
      .sort({ createdAt: 1 })
      .project({ _id: 1, userId: 1, userName: 1, totalPrice: 1, status: 1, createdAt: 1 })
      .toArray();

    return data;
  }

  // 13. SỐ SẢN PHẨM TRUNG BÌNH / ĐƠN & GIÁ TRỊ ĐƠN TRUNG BÌNH

  async getOrderAverages({ from, to } = {}) {
    const dateFilter = this._buildDateFilter(from, to);

    const data = await this.Order.aggregate([
      { $match: { ...dateFilter, status: "delivered" } },
      {
        $group: {
          _id:           null,
          avgOrderValue: { $avg: "$totalPrice" },
          avgItems:      { $avg: "$totalQuantity" },
          maxOrder:      { $max: "$totalPrice" },
          minOrder:      { $min: "$totalPrice" },
        },
      },
    ]).toArray();

    return data[0] || { avgOrderValue: 0, avgItems: 0, maxOrder: 0, minOrder: 0 };
  }
}

module.exports = StatisticService;