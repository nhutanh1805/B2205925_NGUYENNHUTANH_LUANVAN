<template>
  <div class="statistic-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Quản trị viên
        </div>

        <h1 class="hero-title">
          Thống kê<br/>
          <em>kinh doanh</em>
        </h1>

        <p class="hero-sub">Doanh thu · Đơn hàng · Khách hàng · Sản phẩm</p>

        <div class="hero-stats" v-if="overview">
          <div class="hero-stat">
            <span class="stat-num">{{ formatShort(overview.data.totalRevenue) }}</span>
            <span class="stat-lbl">Doanh thu</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ overview.data.totalOrders }}</span>
            <span class="stat-lbl">Tổng đơn</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ overview.data.totalCustomers }}</span>
            <span class="stat-lbl">Khách hàng</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ overview.data.cancelRate }}%</span>
            <span class="stat-lbl">Tỉ lệ huỷ</span>
          </div>
        </div>
        <div class="hero-stats" v-else>
          <div class="hero-stat">
            <span class="stat-num">—</span>
            <span class="stat-lbl">Đang tải...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <!-- Filter bar -->
      <div class="top-bar">
        <div class="result-info">
          Thống kê từ
          <span class="result-num">{{ filter.from }}</span>
          đến
          <span class="result-num">{{ filter.to }}</span>
        </div>
        <div class="filter-bar">
          <input type="date" v-model="filter.from" />
          <span class="filter-sep">→</span>
          <input type="date" v-model="filter.to" />
          <select v-model="filter.period">
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
          <button class="btn-apply" @click="loadAll" :disabled="loading">
            {{ loading ? "Đang tải..." : "Áp dụng" }}
          </button>
        </div>
      </div>

      <!-- SKELETON -->
      <div v-if="loading" class="skeleton-grid">
        <div v-for="i in 5" :key="i" class="skeleton-card">
          <div class="sk sk-title"></div>
          <div class="sk sk-value"></div>
          <div class="sk sk-sub"></div>
        </div>
      </div>

      <template v-else>

        <!-- KPI Cards -->
        <div class="kpi-grid" v-if="overview">
          <div class="kpi-card" :style="`--delay:0s`">
            <span class="kpi-label">Doanh thu</span>
            <span class="kpi-value">{{ formatCurrency(overview.data.totalRevenue) }}</span>
            <span class="kpi-growth" :class="growthClass(growth?.growth?.revenue)">
              {{ formatGrowth(growth?.growth?.revenue) }}
            </span>
          </div>
          <div class="kpi-card" :style="`--delay:0.04s`">
            <span class="kpi-label">Tổng đơn</span>
            <span class="kpi-value">{{ overview.data.totalOrders }}</span>
            <span class="kpi-growth" :class="growthClass(growth?.growth?.orders)">
              {{ formatGrowth(growth?.growth?.orders) }}
            </span>
          </div>
          <div class="kpi-card" :style="`--delay:0.08s`">
            <span class="kpi-label">Khách hàng</span>
            <span class="kpi-value">{{ overview.data.totalCustomers }}</span>
            <span class="kpi-growth" :class="growthClass(growth?.growth?.customers)">
              {{ formatGrowth(growth?.growth?.customers) }}
            </span>
          </div>
          <div class="kpi-card" :style="`--delay:0.12s`">
            <span class="kpi-label">Giá trị TB / đơn</span>
            <span class="kpi-value">{{ formatCurrency(overview.data.averageOrderValue) }}</span>
          </div>
          <div class="kpi-card" :style="`--delay:0.16s`">
            <span class="kpi-label">Tỉ lệ huỷ</span>
            <span class="kpi-value cancel">{{ overview.data.cancelRate }}%</span>
          </div>
        </div>

        <!-- ══ LỢI NHUẬN ══ -->
        <div class="card profit-card" v-if="profit">
          <h2>Doanh thu &amp; Lợi nhuận</h2>

          <!-- Summary KPIs -->
          <div class="profit-summary">
            <div class="profit-kpi">
              <span class="profit-kpi-label">Doanh thu</span>
              <span class="profit-kpi-value revenue">{{ formatCurrency(profit.data.summary.revenue) }}</span>
            </div>
            <div class="profit-arrow">→</div>
            <div class="profit-kpi">
              <span class="profit-kpi-label">Giá vốn</span>
              <span class="profit-kpi-value cost">{{ formatCurrency(profit.data.summary.cost) }}</span>
            </div>
            <div class="profit-arrow">=</div>
            <div class="profit-kpi highlight">
              <span class="profit-kpi-label">Lợi nhuận</span>
              <span class="profit-kpi-value profit-color">{{ formatCurrency(profit.data.summary.profit) }}</span>
            </div>
            <div class="profit-kpi">
              <span class="profit-kpi-label">Biên lợi nhuận</span>
              <span class="profit-kpi-value margin-color">{{ profit.data.summary.margin }}%</span>
            </div>
          </div>

          <!-- Detail table -->
          <table v-if="profit.data.data?.length">
            <thead>
              <tr>
                <th>Kỳ</th>
                <th>Doanh thu</th>
                <th>Giá vốn</th>
                <th>Lợi nhuận</th>
                <th>Biên LN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in profit.data.data" :key="i">
                <td>{{ formatPeriodLabel(row._id) }}</td>
                <td class="price">{{ formatCurrency(row.revenue) }}</td>
                <td class="cost">{{ formatCurrency(row.cost) }}</td>
                <td :class="row.profit >= 0 ? 'profit-pos' : 'profit-neg'">
                  {{ formatCurrency(row.profit) }}
                </td>
                <td>
                  <span class="margin-badge" :class="row.margin >= 30 ? 'margin-good' : row.margin >= 10 ? 'margin-ok' : 'margin-low'">
                    {{ row.margin }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">Không có dữ liệu</p>
        </div>

        <!-- Doanh thu & Đơn hàng theo thời gian -->
        <div class="section-row">
          <div class="card">
            <h2>Doanh thu theo thời gian</h2>
            <table v-if="revenue?.data?.length">
              <thead>
                <tr><th>Kỳ</th><th>Doanh thu</th><th>Số đơn</th><th>COD</th><th>VNPAY</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in revenue.data" :key="i">
                  <td>{{ formatPeriodLabel(row._id) }}</td>
                  <td class="price">{{ formatCurrency(row.revenue) }}</td>
                  <td>{{ row.orders }}</td>
                  <td>{{ formatCurrency(row.cod) }}</td>
                  <td>{{ formatCurrency(row.vnpay) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
          <div class="card">
            <h2>Đơn hàng theo thời gian</h2>
            <table v-if="ordersByPeriod?.data?.length">
              <thead>
                <tr><th>Kỳ</th><th>Tổng</th><th>Chờ</th><th>Giao</th><th>Huỷ</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in ordersByPeriod.data" :key="i">
                  <td>{{ formatPeriodLabel(row._id) }}</td>
                  <td><strong>{{ row.total }}</strong></td>
                  <td>{{ row.pending }}</td>
                  <td>{{ row.delivered }}</td>
                  <td class="cancel">{{ row.cancelled }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
        </div>

        <!-- Top khách & Khách hay huỷ -->
        <div class="section-row">
          <div class="card">
            <h2>Top khách hàng</h2>
            <table v-if="topCustomers?.data?.length">
              <thead><tr><th>#</th><th>Tên</th><th>Tổng chi</th><th>Số đơn</th></tr></thead>
              <tbody>
                <tr v-for="(c, i) in topCustomers.data" :key="c._id">
                  <td><span class="rank">{{ i + 1 }}</span></td>
                  <td>{{ c.userName || c._id }}</td>
                  <td class="price">{{ formatCurrency(c.totalSpent) }}</td>
                  <td>{{ c.totalOrders }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
          <div class="card">
            <h2>Khách hay huỷ đơn</h2>
            <table v-if="cancelCustomers?.data?.length">
              <thead><tr><th>#</th><th>Tên</th><th>Số lần huỷ</th></tr></thead>
              <tbody>
                <tr v-for="(c, i) in cancelCustomers.data" :key="c._id">
                  <td><span class="rank">{{ i + 1 }}</span></td>
                  <td>{{ c.userName || c._id }}</td>
                  <td><span class="badge badge-cancel">{{ c.cancelCount }}</span></td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
        </div>

        <!-- Top sản phẩm & Sản phẩm hay bị huỷ -->
        <div class="section-row">
          <div class="card">
            <h2>Sản phẩm bán chạy</h2>
            <table v-if="topProducts?.data?.length">
              <thead><tr><th>#</th><th>Sản phẩm</th><th>SL bán</th><th>Doanh thu</th></tr></thead>
              <tbody>
                <tr v-for="(p, i) in topProducts.data" :key="p._id">
                  <td><span class="rank">{{ i + 1 }}</span></td>
                  <td>{{ p.name }}</td>
                  <td>{{ p.quantity }}</td>
                  <td class="price">{{ formatCurrency(p.revenue) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
          <div class="card">
            <h2>Sản phẩm hay bị huỷ</h2>
            <table v-if="cancelledProducts?.data?.length">
              <thead><tr><th>#</th><th>Sản phẩm</th><th>Số lần huỷ</th></tr></thead>
              <tbody>
                <tr v-for="(p, i) in cancelledProducts.data" :key="p._id">
                  <td><span class="rank">{{ i + 1 }}</span></td>
                  <td>{{ p.name }}</td>
                  <td><span class="badge badge-cancel">{{ p.cancelCount }}</span></td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
        </div>

        <!-- Ngày trong tuần -->
        <div class="card">
          <h2>Đơn theo ngày trong tuần</h2>
          <div class="bar-chart" v-if="ordersByDay?.data?.length">
            <div class="bar-item" v-for="item in ordersByDay.data" :key="item.day">
              <div class="bar-track">
                <div class="bar-fill bar-fill-purple" :style="{ height: barHeight(item.count, ordersByDay.data) + '%' }" :title="`${item.day}: ${item.count} đơn`"></div>
              </div>
              <span class="bar-label">{{ item.day }}</span>
            </div>
          </div>
          <p v-else class="empty">Không có dữ liệu</p>
        </div>

        <!-- Thanh toán & Trung bình đơn -->
        <div class="section-row">
          <div class="card">
            <h2>Phương thức thanh toán</h2>
            <table v-if="paymentStats?.data?.filter(p => p._id).length">
              <thead><tr><th>Phương thức</th><th>Số đơn</th><th>Doanh thu</th></tr></thead>
              <tbody>
                <tr v-for="p in paymentStats.data.filter(p => p._id)" :key="p._id">
                  <td>
                    <span class="payment-badge" :class="p._id === 'VNPAY' ? 'pay-vnpay' : 'pay-cod'">
                      {{ p._id }}
                    </span>
                  </td>
                  <td>{{ p.count }}</td>
                  <td class="price">{{ formatCurrency(p.revenue) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
          <div class="card">
            <h2>Chỉ số trung bình đơn hàng</h2>
            <div class="avg-grid" v-if="orderAverages?.data">
              <div class="avg-item">
                <span>Giá trị TB</span>
                <strong>{{ formatCurrency(orderAverages.data.avgOrderValue) }}</strong>
              </div>
              <div class="avg-item">
                <span>SP trung bình / đơn</span>
                <strong>{{ (orderAverages.data.avgItems || 0).toFixed(1) }}</strong>
              </div>
              <div class="avg-item">
                <span>Đơn cao nhất</span>
                <strong class="price">{{ formatCurrency(orderAverages.data.maxOrder) }}</strong>
              </div>
              <div class="avg-item">
                <span>Đơn thấp nhất</span>
                <strong>{{ formatCurrency(orderAverages.data.minOrder) }}</strong>
              </div>
            </div>
            <p v-else class="empty">Không có dữ liệu</p>
          </div>
        </div>

        <!-- Đơn chờ quá lâu -->
        <div class="card">
          <h2>
            Đơn chờ xử lý quá lâu
            <span class="badge badge-warn" v-if="staleOrders?.data?.length">
              {{ staleOrders.data.length }} đơn
            </span>
          </h2>
          <table v-if="staleOrders?.data?.length">
            <thead>
              <tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Tạo lúc</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in staleOrders.data" :key="o._id">
                <td class="mono">#{{ o._id.slice(-8).toUpperCase() }}</td>
                <td>{{ o.userName || o.userId }}</td>
                <td class="price">{{ formatCurrency(o.totalPrice) }}</td>
                <td><span class="status-badge badge-pending"><i class="dot"></i>{{ o.status }}</span></td>
                <td class="date">{{ formatDate(o.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">Không có đơn nào chờ quá lâu ✓</p>
        </div>

      </template>
    </div>
  </div>
</template>

<script>
import statisticService from "@/services/statistic.service";

export default {
  name: "StatisticView",
  data() {
    return {
      loading: false,
      filter: {
        from: this.defaultFrom(),
        to: this.defaultTo(),
        period: "day",
      },
      overview: null, growth: null, revenue: null, ordersByPeriod: null,
      topCustomers: null, cancelCustomers: null,
      topProducts: null, cancelledProducts: null,
      ordersByHour: null, ordersByDay: null,
      paymentStats: null, staleOrders: null, orderAverages: null,
      profit: null,
    };
  },
  mounted() { this.loadAll(); },
  methods: {
    defaultFrom() {
      const d = new Date(); d.setDate(d.getDate() - 30);
      return d.toISOString().split("T")[0];
    },
    defaultTo() { return new Date().toISOString().split("T")[0]; },

    async loadAll() {
      this.loading = true;
      const { from, to, period } = this.filter;
      try {
        const [
          overview, growth, revenue, ordersByPeriod,
          topCustomers, cancelCustomers,
          topProducts, cancelledProducts,
          ordersByHour, ordersByDay,
          paymentStats, staleOrders, orderAverages,
          profit,
        ] = await Promise.all([
          statisticService.getOverview({ from, to }),
          statisticService.getGrowthComparison({ from, to }),
          statisticService.getRevenueByPeriod({ from, to, period }),
          statisticService.getOrdersByPeriod({ from, to, period }),
          statisticService.getTopCustomers({ from, to }),
          statisticService.getTopCancelCustomers({ from, to }),
          statisticService.getTopProducts({ from, to }),
          statisticService.getMostCancelledProducts({ from, to }),
          statisticService.getOrdersByHour({ from, to }),
          statisticService.getOrdersByDayOfWeek({ from, to }),
          statisticService.getPaymentMethodStats({ from, to }),
          statisticService.getStaleOrders(),
          statisticService.getOrderAverages({ from, to }),
          statisticService.getProfit({ from, to, period }),
        ]);
        Object.assign(this, {
          overview, growth, revenue, ordersByPeriod,
          topCustomers, cancelCustomers,
          topProducts, cancelledProducts,
          ordersByHour, ordersByDay,
          paymentStats, staleOrders, orderAverages,
          profit,
        });
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(v) {
      if (!v) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
    },
    formatShort(v) {
      if (!v) return "0";
      if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "B";
      if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1) + "M";
      if (v >= 1_000)         return (v / 1_000).toFixed(0) + "K";
      return v.toString();
    },
    formatDate(d) {
      if (!d) return "-";
      return new Date(d).toLocaleString("vi-VN");
    },
    formatPeriodLabel(id) {
      if (!id) return "-";
      const { year, month, day, week } = id;
      if (day)   return `${day}/${month}/${year}`;
      if (week)  return `Tuần ${week}/${year}`;
      if (month) return `${month}/${year}`;
      return `${year}`;
    },
    formatGrowth(v) {
      if (v === null || v === undefined) return "";
      return v >= 0 ? `+${v}%` : `${v}%`;
    },
    growthClass(v) {
      if (v === null || v === undefined) return "";
      return v >= 0 ? "up" : "down";
    },
    barHeight(count, data) {
      const max = Math.max(...data.map(d => d.count), 1);
      return Math.round((count / max) * 100);
    },
  },
};
</script>

<style scoped>
.statistic-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 72px 32px 80px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%,  rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3),  transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%,  rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width:300px; height:300px; background:rgba(37,99,235,.25);  top:-80px;  left:-60px; }
.hero-orb-2 { width:250px; height:250px; background:rgba(124,58,237,.2);  bottom:-60px; right:-40px; }
.hero-orb-3 { width:180px; height:180px; background:rgba(16,185,129,.15); top:40%; left:55%; }

.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 22px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width:7px; height:7px; border-radius:50%;
  background:#f97316; box-shadow:0 0 8px #f97316;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }

.hero-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(2.4rem,6vw,4rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.01em;
  margin-bottom: 14px; text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: italic;
  background: linear-gradient(90deg,#60a5fa,#a78bfa,#34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size:1rem; color:rgba(255,255,255,.55); letter-spacing:.06em; margin-bottom:36px; }

.hero-stats {
  display: inline-flex; align-items: center; gap: 24px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 18px 32px; backdrop-filter: blur(16px);
}
.hero-stat { text-align: center; }
.stat-num {
  display: block; font-family: 'Times New Roman', Times, serif;
  font-size: 1.8rem; font-weight: 900; color: white; line-height: 1;
}
.stat-lbl { font-size:.7rem; color:rgba(255,255,255,.5); letter-spacing:.07em; text-transform:uppercase; margin-top:3px; display:block; }
.stat-divider { width:1px; height:36px; background:rgba(255,255,255,.15); }

/* ══ MAIN ══ */
.main-panel {
  max-width: 1100px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* TOP BAR */
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: white; border-radius: 20px; padding: 16px 24px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  margin-bottom: 20px; border: 1px solid rgba(37,99,235,.1);
  flex-wrap: wrap; gap: 12px;
}
.result-info { font-size:.9rem; color:#64748b; font-weight:500; }
.result-num  { font-family:'Times New Roman',Times,serif; font-size:1rem; font-weight:900; color:#2563eb; }

.filter-bar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.filter-bar input,
.filter-bar select {
  padding:7px 10px; border:1.5px solid #e0e7ff; border-radius:10px;
  font-size:.82rem; background:#f8faff; color:#334155; outline:none; transition:border-color .2s;
}
.filter-bar input:focus,
.filter-bar select:focus { border-color:#a5b4fc; }
.filter-sep { color:#94a3b8; font-weight:700; }

.btn-apply {
  padding:8px 20px; border-radius:10px;
  background:linear-gradient(135deg,#2563eb,#4f46e5);
  color:white; font-size:.82rem; font-weight:700; border:none; cursor:pointer;
  box-shadow:0 4px 14px rgba(37,99,235,.3); transition:all .2s;
}
.btn-apply:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,.4); }
.btn-apply:disabled { background:#a5b4fc; cursor:not-allowed; transform:none; box-shadow:none; }

/* SKELETON */
.skeleton-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
  gap:16px; margin-bottom:20px;
}
.skeleton-card {
  background:white; border-radius:16px; padding:20px;
  display:flex; flex-direction:column; gap:10px;
  border:1px solid #e8edf8; animation:pulse 1.6s ease-in-out infinite;
}
.sk { background:#e8edf8; border-radius:6px; }
.sk-title { height:12px; width:60%; }
.sk-value { height:28px; width:80%; }
.sk-sub   { height:10px; width:40%; }
@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }

/* KPI */
.kpi-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
  gap:16px; margin-bottom:20px;
}
.kpi-card {
  background:white; border-radius:16px; padding:20px 18px;
  display:flex; flex-direction:column; gap:6px;
  box-shadow:0 4px 20px rgba(10,15,30,.07);
  border:1px solid rgba(37,99,235,.08);
  animation:cardIn .4s ease both;
  animation-delay:var(--delay,0s);
}
@keyframes cardIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.kpi-label { font-size:.72rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.07em; font-weight:600; }
.kpi-value { font-family:'Times New Roman',Times,serif; font-size:1.4rem; font-weight:900; color:#0f172a; }
.kpi-value.cancel { color:#ef4444; }
.kpi-growth { font-size:.8rem; font-weight:700; }
.kpi-growth.up   { color:#16a34a; }
.kpi-growth.down { color:#ef4444; }

/* ══ PROFIT CARD ══ */
.profit-card { margin-bottom: 20px; }

.profit-summary {
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap; margin-bottom: 20px;
  padding: 16px; background: #f8faff; border-radius: 12px;
  border: 1px solid #e0e7ff;
}
.profit-kpi {
  display: flex; flex-direction: column; gap: 4px;
  padding: 12px 18px; background: white; border-radius: 10px;
  border: 1px solid #e8edf8; min-width: 140px;
}
.profit-kpi.highlight {
  border-color: #bbf7d0; background: #f0fdf4;
}
.profit-kpi-label {
  font-size: .68rem; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em; font-weight: 600;
}
.profit-kpi-value {
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.15rem; font-weight: 900;
}
.profit-kpi-value.revenue  { color: #2563eb; }
.profit-kpi-value.cost     { color: #dc2626; }
.profit-kpi-value.profit-color  { color: #16a34a; }
.profit-kpi-value.margin-color  { color: #7c3aed; }

.profit-arrow { font-size: 1.2rem; color: #94a3b8; font-weight: 700; }

td.cost      { color: #dc2626; font-weight: 600; }
td.profit-pos { color: #16a34a; font-weight: 700; font-family: 'Times New Roman', Times, serif; }
td.profit-neg { color: #dc2626; font-weight: 700; font-family: 'Times New Roman', Times, serif; }

.margin-badge {
  display: inline-block; padding: 2px 10px; border-radius: 999px;
  font-size: .72rem; font-weight: 700;
}
.margin-good { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.margin-ok   { background: #fef9c3; color: #a16207; border: 1px solid #fef08a; }
.margin-low  { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }

/* SECTIONS */
.section-row {
  display:grid; grid-template-columns:1fr 1fr;
  gap:20px; margin-bottom:20px;
}
@media (max-width:768px) { .section-row { grid-template-columns:1fr; } }

/* CARD */
.card {
  background:white; border-radius:18px; padding:22px;
  box-shadow:0 4px 20px rgba(10,15,30,.07);
  border:1px solid rgba(37,99,235,.08);
  margin-bottom:20px;
}
.card h2 {
  font-family:'Times New Roman',Times,serif;
  font-size:.95rem; font-weight:700; margin:0 0 16px;
  color:#0f172a; display:flex; align-items:center; gap:8px;
}

/* TABLE */
table { width:100%; border-collapse:collapse; font-size:.85rem; }
th {
  text-align:left; padding:8px 10px;
  color:#94a3b8; font-weight:700; font-size:.7rem;
  text-transform:uppercase; letter-spacing:.06em;
  border-bottom:2px solid #f1f5f9;
}
td { padding:10px; border-bottom:1px solid #f8faff; color:#334155; }
tr:last-child td { border-bottom:none; }
tr:hover td { background:#f8faff; }
td.cancel { color:#ef4444; font-weight:700; }
td.price  { font-family:'Times New Roman',Times,serif; font-weight:700; color:#e11d48; }
td.date   { font-size:.78rem; color:#94a3b8; }
td.mono   { font-family:monospace; font-size:.78rem; color:#64748b; font-weight:700; }

/* RANK */
.rank {
  display:inline-flex; align-items:center; justify-content:center;
  width:22px; height:22px; border-radius:50%;
  background:#eff6ff; color:#2563eb;
  font-size:.72rem; font-weight:800;
}

/* BADGES */
.badge { display:inline-block; padding:2px 10px; border-radius:999px; font-size:.72rem; font-weight:700; }
.badge-cancel { background:#fee2e2; color:#dc2626; border:1px solid #fecaca; }
.badge-warn   { background:#fef3c7; color:#d97706; border:1px solid #fde68a; }

.status-badge {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 11px; border-radius:999px;
  font-size:.7rem; font-weight:700; letter-spacing:.04em;
}
.dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor; }
.badge-pending { background:#fef3c7; color:#d97706; border:1px solid #fde68a; }

.payment-badge {
  display:inline-flex; align-items:center; gap:4px;
  padding:4px 12px; border-radius:999px;
  font-size:.7rem; font-weight:700; letter-spacing:.04em;
}
.pay-cod   { background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; }
.pay-vnpay { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }

/* BAR CHART */
.bar-chart { display:flex; align-items:flex-end; gap:3px; height:130px; padding-bottom:22px; }
.bar-item  { display:flex; flex-direction:column; align-items:center; flex:1; }
.bar-track { width:100%; height:100px; display:flex; align-items:flex-end; }
.bar-fill  {
  width:100%; background:linear-gradient(180deg,#60a5fa,#2563eb);
  border-radius:4px 4px 0 0; min-height:2px;
  transition:height .4s cubic-bezier(.175,.885,.32,1.275);
}
.bar-fill-purple { background:linear-gradient(180deg,#c084fc,#7c3aed); }
.bar-label { font-size:.58rem; color:#94a3b8; margin-top:4px; }

/* AVG */
.avg-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.avg-item {
  background:#f8faff; border-radius:10px; padding:14px;
  display:flex; flex-direction:column; gap:4px; border:1px solid #e0e7ff;
}
.avg-item span { font-size:.72rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
.avg-item strong { font-family:'Times New Roman',Times,serif; font-size:1.05rem; font-weight:900; color:#0f172a; }
.avg-item strong.price { color:#e11d48; }

.empty { color:#94a3b8; font-size:.875rem; text-align:center; padding:28px 0; }

@media (max-width:640px) {
  .hero { padding:50px 20px 60px; }
  .main-panel { padding:0 14px 40px; }
  .hero-stats { gap:14px; padding:14px 18px; }
  .profit-summary { flex-direction: column; }
  .profit-kpi { min-width: unset; width: 100%; }
}
</style>