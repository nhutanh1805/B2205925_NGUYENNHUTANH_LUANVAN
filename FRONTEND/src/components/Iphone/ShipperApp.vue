<template>
  <div class="shipper-app">

    <!-- HEADER -->
    <div class="app-header">
      <div class="header-top">
        <div class="avatar">🛵</div>
        <div class="header-info">
          <span class="header-greeting">Xin chào, Shipper!</span>
          <span class="header-sub">{{ todayStr }}</span>
        </div>
        <div class="notif-btn">
          <span class="notif-dot" v-if="pendingShip > 0"></span>
          🔔
        </div>
      </div>

      <!-- STATS ROW -->
      <div class="stats-row">
        <div class="stat-pill stat-confirm">
          <span class="sp-num">{{ confirmedCount }}</span>
          <span class="sp-lbl">Chờ lấy</span>
        </div>
        <div class="stat-pill stat-ship">
          <span class="sp-num">{{ shippingCount }}</span>
          <span class="sp-lbl">Đang giao</span>
        </div>
        <div class="stat-pill stat-done">
          <span class="sp-num">{{ deliveredCount }}</span>
          <span class="sp-lbl">Hoàn thành</span>
        </div>
      </div>
    </div>

    <!-- FILTER TABS -->
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-btn"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span class="tab-badge" v-if="tabCount(tab.value) > 0">{{ tabCount(tab.value) }}</span>
      </button>
    </div>

    <!-- ORDER LIST -->
    <div class="order-list" ref="listRef">

      <!-- SKELETON -->
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="skel-card">
          <div class="skel skel-top"></div>
          <div class="skel skel-mid"></div>
          <div class="skel skel-bot"></div>
        </div>
      </template>

      <!-- EMPTY -->
      <div v-else-if="filteredOrders.length === 0" class="empty-box">
        <div class="empty-emoji">📭</div>
        <p class="empty-txt">Không có đơn nào</p>
      </div>

      <!-- CARDS -->
      <template v-else>
        <div
          v-for="(order, idx) in filteredOrders"
          :key="order._id"
          class="order-card"
          :class="`card-${order.status}`"
          :style="`animation-delay:${idx * 0.06}s`"
        >
          <!-- TOP ROW -->
          <div class="card-top">
            <div class="card-id">#{{ order._id.slice(-6).toUpperCase() }}</div>
            <span class="status-chip" :class="`chip-${order.status}`">
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <!-- INFO -->
          <div class="card-info">
            <div class="info-row">
              <span class="info-icon">📍</span>
              <span class="info-txt address-txt">{{ order.shippingAddress }}</span>
            </div>
            <div class="info-row">
              <span class="info-icon">📞</span>
              <span class="info-txt">{{ order.phone }}</span>
            </div>
            <div class="info-row">
              <span class="info-icon">👤</span>
              <span class="info-txt">{{ order.userName }}</span>
            </div>
            <div class="info-row">
              <span class="info-icon">💰</span>
              <span class="info-txt price-txt">{{ formatPrice(order.totalPrice) }}₫</span>
            </div>
          </div>

          <!-- ITEMS MINI -->
          <div class="items-row">
            <span
              v-for="(item, i) in order.items.slice(0, 2)"
              :key="i"
              class="item-chip"
            >{{ item.name }} ×{{ item.quantity }}</span>
            <span v-if="order.items.length > 2" class="item-more">+{{ order.items.length - 2 }}</span>
          </div>

          <!-- ACTION BUTTON -->
          <div class="card-action">
            <template v-if="order.status === 'confirmed'">
              <button
                class="action-btn btn-pickup"
                :disabled="updating === order._id"
                @click.stop="changeStatus(order._id, 'shipping')"
              >
                <span v-if="updating === order._id" class="spinner"></span>
                <span v-else>Bắt đầu giao</span>
              </button>
            </template>

            <template v-else-if="order.status === 'shipping'">
              <button
                class="action-btn btn-done"
                :disabled="updating === order._id"
                @click.stop="changeStatus(order._id, 'delivered')"
              >
                <span v-if="updating === order._id" class="spinner"></span>
                <span v-else>Giao thành công</span>
              </button>
            </template>

            <template v-else-if="order.status === 'delivered'">
              <div class="done-label">🎉 Đã hoàn thành</div>
            </template>
          </div>
        </div>
      </template>
    </div>

    <!-- BOTTOM NAV -->
    <div class="bottom-nav">
      <button class="nav-btn active">
        <span class="nav-icon">📦</span>
        <span class="nav-lbl">Đơn hàng</span>
      </button>
      <button class="nav-btn" @click="loadOrders">
        <span class="nav-icon">🔄</span>
        <span class="nav-lbl">Làm mới</span>
      </button>
      <button class="nav-btn">
        <span class="nav-icon">👤</span>
        <span class="nav-lbl">Tôi</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import OrderService from "@/services/order.service"

// ── State ──────────────────────────────────────────
const allOrders  = ref([])
const loading    = ref(true)
const updating   = ref(null)
const activeTab  = ref("all")

const tabs = [
  { label: "Tất cả",   value: "all"       },
  { label: "Chờ lấy",  value: "confirmed" },
  { label: "Đang giao", value: "shipping" },
  { label: "Hoàn thành", value: "delivered" },
]

// ── Helpers ────────────────────────────────────────
const SHIPPER_STATUSES = ["confirmed", "shipping", "delivered"]

const statusLabel = (s) => ({
  confirmed: "Chờ lấy",
  shipping:  "Đang giao",
  delivered: "Hoàn thành",
}[s] || s)

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v)

const todayStr = computed(() =>
  new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })
)

// ── Computed ───────────────────────────────────────
const shipperOrders = computed(() =>
  allOrders.value.filter(o => SHIPPER_STATUSES.includes(o.status))
)

const filteredOrders = computed(() =>
  activeTab.value === "all"
    ? shipperOrders.value
    : shipperOrders.value.filter(o => o.status === activeTab.value)
)

const confirmedCount = computed(() => shipperOrders.value.filter(o => o.status === "confirmed").length)
const shippingCount  = computed(() => shipperOrders.value.filter(o => o.status === "shipping").length)
const deliveredCount = computed(() => shipperOrders.value.filter(o => o.status === "delivered").length)
const pendingShip    = computed(() => confirmedCount.value + shippingCount.value)

const tabCount = (val) => {
  if (val === "all") return 0
  return shipperOrders.value.filter(o => o.status === val).length
}

// ── API ─────────────────────────────────────────────
const loadOrders = async () => {
  loading.value = true
  try {
    // Lấy tất cả đơn, lọc phía client
    let page = 1
    let collected = []
    while (true) {
      const res = await OrderService.getAllOrders({ page, limit: 50 })
      collected = [...collected, ...res.data]
      if (page >= res.pagination.totalPages) break
      page++
    }
    allOrders.value = collected
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const changeStatus = async (id, newStatus) => {
  updating.value = id
  try {
    await OrderService.updateOrderStatus(id, newStatus)
    // cập nhật local, không reload toàn bộ
    const order = allOrders.value.find(o => o._id === id)
    if (order) order.status = newStatus
  } catch (e) {
    alert(e.message || "Cập nhật thất bại")
  } finally {
    updating.value = null
  }
}

onMounted(loadOrders)
</script>

<style scoped>
/* ── ROOT ─────────────────────────────────────────── */
.shipper-app {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f0f2f8;
  font-family: 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  overflow: hidden;
  z-index: 50;
}

/* ── HEADER ───────────────────────────────────────── */
.app-header {
  background: linear-gradient(145deg, #1a1f3c 0%, #2d3561 100%);
  padding: 10px 14px 12px;
  flex-shrink: 0;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header-greeting {
  font-size: .7rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.header-sub {
  font-size: .58rem;
  color: rgba(255,255,255,.5);
  text-transform: capitalize;
}

.notif-btn {
  position: relative;
  font-size: 1rem;
  cursor: pointer;
}

.notif-dot {
  position: absolute;
  top: -2px; right: -2px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #f97316;
  box-shadow: 0 0 6px #f97316;
  animation: pulse-dot 1.8s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,100%{ transform:scale(1); opacity:1 }
  50%{ transform:scale(1.5); opacity:.6 }
}

/* STATS ROW */
.stats-row {
  display: flex;
  gap: 7px;
}

.stat-pill {
  flex: 1;
  border-radius: 10px;
  padding: 7px 6px;
  text-align: center;
  backdrop-filter: blur(8px);
}

.stat-confirm { background: rgba(251,191,36,.18); border: 1px solid rgba(251,191,36,.3); }
.stat-ship    { background: rgba(139,92,246,.2);  border: 1px solid rgba(139,92,246,.3); }
.stat-done    { background: rgba(52,211,153,.18); border: 1px solid rgba(52,211,153,.3); }

.sp-num {
  display: block;
  font-size: 1.1rem;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}

.sp-lbl {
  font-size: .55rem;
  color: rgba(255,255,255,.6);
  letter-spacing: .04em;
  text-transform: uppercase;
}

/* ── FILTER TABS ──────────────────────────────────── */
.filter-tabs {
  display: flex;
  gap: 6px;
  padding: 8px 12px 6px;
  background: #fff;
  border-bottom: 1px solid #e8edf8;
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-tabs::-webkit-scrollbar { display: none; }

.tab-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1.5px solid #e0e7ff;
  background: #f8faff;
  color: #64748b;
  font-size: .65rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #2d3561, #4f46e5);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(79,70,229,.3);
}

.tab-badge {
  background: #ef4444;
  color: #fff;
  border-radius: 999px;
  padding: 1px 5px;
  font-size: .55rem;
  font-weight: 900;
}

/* ── ORDER LIST ───────────────────────────────────── */
.order-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 10px 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
  scrollbar-width: none;
}
.order-list::-webkit-scrollbar { display: none; }

/* SKELETON */
.skel-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skel {
  background: #e8edf8;
  border-radius: 6px;
}
.skel-top { height: 10px; width: 60%; }
.skel-mid { height: 8px; width: 85%; }
.skel-bot { height: 8px; width: 40%; }
@keyframes shimmer {
  0%,100%{ opacity:.5 }
  50%{ opacity:1 }
}

/* EMPTY */
.empty-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.empty-emoji { font-size: 2.5rem; margin-bottom: 8px; }
.empty-txt { font-size: .8rem; color: #94a3b8; font-weight: 600; }

/* ── ORDER CARD ───────────────────────────────────── */
.order-card {
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #e8edf8;
  padding: 12px 13px;
  animation: cardIn .35s ease both;
  border-left-width: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,.05);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-confirmed { border-left-color: #f59e0b; }
.card-shipping  { border-left-color: #8b5cf6; }
.card-delivered { border-left-color: #10b981; }

/* TOP ROW */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.card-id {
  font-size: .75rem;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: .04em;
}

.status-chip {
  font-size: .6rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: .03em;
}
.chip-confirmed { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.chip-shipping  { background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.chip-delivered { background: #d1fae5; color: #059669; border: 1px solid #6ee7b7; }

/* INFO */
.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}

.info-icon { font-size: .7rem; flex-shrink: 0; margin-top: 1px; }
.info-txt {
  font-size: .68rem;
  color: #475569;
  line-height: 1.3;
}
.address-txt {
  font-weight: 600;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.price-txt {
  font-weight: 800;
  color: #e11d48;
  font-size: .75rem;
}

/* ITEMS */
.items-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 9px;
}

.item-chip {
  font-size: .58rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px 7px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.item-more {
  font-size: .58rem;
  background: #dbeafe;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 2px 7px;
  font-weight: 700;
}

/* ACTION BUTTON */
.card-action { display: flex; }

.action-btn {
  flex: 1;
  padding: 9px;
  border-radius: 10px;
  border: none;
  font-size: .72rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all .2s;
  letter-spacing: .02em;
}

.btn-pickup {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 4px 12px rgba(245,158,11,.35);
}
.btn-pickup:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(245,158,11,.45); }

.btn-done {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16,185,129,.35);
}
.btn-done:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,.45); }

.action-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.done-label {
  flex: 1;
  text-align: center;
  font-size: .68rem;
  font-weight: 700;
  color: #059669;
  background: #d1fae5;
  border-radius: 10px;
  padding: 8px;
  border: 1px solid #6ee7b7;
}

/* SPINNER */
.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── BOTTOM NAV ───────────────────────────────────── */
.bottom-nav {
  display: flex;
  background: #fff;
  border-top: 1px solid #e8edf8;
  padding: 6px 0 10px;
  flex-shrink: 0;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: opacity .2s;
}

.nav-icon { font-size: 1.1rem; }
.nav-lbl {
  font-size: .55rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: .04em;
}

.nav-btn.active .nav-lbl { color: #4f46e5; }
.nav-btn.active .nav-icon { filter: drop-shadow(0 2px 4px rgba(79,70,229,.4)); }
</style>