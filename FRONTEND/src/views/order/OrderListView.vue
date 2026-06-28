<template>
  <div class="admin-orders-page">

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
          Quản lý<br/>
          <em>đơn hàng</em>
        </h1>

        <p class="hero-sub">Theo dõi · Cập nhật · Xử lý toàn bộ đơn</p>

        <div class="hero-stats" v-if="!loading">
          <div class="hero-stat">
            <span class="stat-num">{{ orders.length }}</span>
            <span class="stat-lbl">Tổng đơn</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ pendingCount }}</span>
            <span class="stat-lbl">Chờ xử lý</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ paidCount }}</span>
            <span class="stat-lbl">Đã thanh toán</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ shippingCount }}</span>
            <span class="stat-lbl">Đang giao</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
           <span class="stat-num">{{ completedCount }}</span>
            <span class="stat-lbl">Hoàn thành</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <!-- Top bar -->
      <div class="top-bar">
        <div class="result-info">
          <span class="result-num">{{ orders.length }}</span> đơn hàng
          <span class="page-info">· Trang {{ pagination.page }}/{{ pagination.totalPages }}</span>
        </div>
        <router-link to="/products" class="btn-shop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="shop-icon">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Xem sản phẩm
        </router-link>
      </div>

      <!-- SKELETON -->
      <div v-if="loading" class="skeleton-list">
        <div v-for="i in 5" :key="i" class="skeleton-card">
          <div class="sk sk-accent"></div>
          <div class="sk sk-id"></div>
          <div class="sk sk-mid"></div>
          <div class="sk sk-badge"></div>
          <div class="sk sk-btn"></div>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-else-if="!orders.length" class="empty-state">
        <div class="empty-icon">📭</div>
        <h2 class="empty-title">Chưa có đơn hàng nào</h2>
        <p class="empty-desc">Khi có đơn mới, chúng sẽ xuất hiện tại đây</p>
        <router-link to="/products" class="btn-explore">Xem sản phẩm →</router-link>
      </div>

      <!-- ORDERS LIST -->
      <div v-else class="orders-list">
        <div
          v-for="(order, idx) in orders"
          :key="order._id"
          class="ocard"
          :style="`--delay:${idx * 0.04}s`"
          @click="goToDetail(order._id)"
        >
          <!-- Accent bar -->
          <div class="ocard-accent" :class="`accent-${order.status}`"></div>

          <!-- Body -->
          <div class="ocard-body">
            <div class="ocard-top">
              <span class="ocard-id">#{{ order._id.slice(-8).toUpperCase() }}</span>
              <span class="ocard-user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ order.userName }}
              </span>
              <span class="status-badge" :class="`badge-${order.status}`">
                <i class="dot"></i>{{ statusText(order.status) }}
              </span>
              <span class="payment-badge" :class="order.paymentMethod === 'VNPAY' ? 'pay-vnpay' : 'pay-cod'">
                {{ order.paymentMethod === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'THANH TOÁN COD' }}
              </span>
              <!-- Shipper badge nếu đã gán -->
              <span v-if="order.shipperId" class="shipper-badge">
                 {{ order.shipperName }}
              </span>
            </div>

            <div class="ocard-stats">
              <div class="ostat">
                <span class="ostat-lbl">Sản phẩm</span>
                <span class="ostat-val">{{ order.totalQuantity }} món</span>
              </div>
              <div class="ostat">
                <span class="ostat-lbl">Tổng tiền</span>
                <span class="ostat-val price">{{ formatPrice(order.totalPrice) }}₫</span>
              </div>
              <div class="ostat">
                <span class="ostat-lbl">Ngày đặt</span>
                <span class="ostat-val date">{{ formatDate(order.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="ocard-actions" @click.stop>
            <select
              :value="order.status"
              @change="updateStatus(order._id, $event.target.value)"
              class="status-select"
              :class="`select-${order.status}`"
              :disabled="isStatusLocked(order.status)"
            >
              <option value="pending"   :disabled="!canTransitionTo(order, 'pending')">Chờ</option>
<option value="confirmed" :disabled="!canTransitionTo(order, 'confirmed')">Đã xác nhận</option>
<option value="paid"      :disabled="!canTransitionTo(order, 'paid') || order.paymentMethod === 'COD'">Đã thanh toán</option>
<option value="preparing" :disabled="!canTransitionTo(order, 'preparing')">Chuẩn bị hàng</option>
<option value="shipping"  :disabled="!canTransitionTo(order, 'shipping')">Đang giao</option>
<option value="failed"    :disabled="!canTransitionTo(order, 'failed')">Giao thất bại</option>
<option value="delivered" :disabled="!canTransitionTo(order, 'delivered')">Đã giao</option>
<option value="completed" :disabled="!canTransitionTo(order, 'completed')">Hoàn thành</option>
<option value="cancelled" :disabled="isStatusLocked(order.status)">Đã hủy</option>
            </select>

            <!-- Nút gán shipper — chỉ hiện khi confirmed và paid-->
            <button
              v-if="['preparing','failed'].includes(order.status)"
              @click="openAssignModal(order)"
              class="btn-assign"
            >
              🛵 {{ order.shipperId ? 'Đổi shipper' : 'Gán shipper' }}
            </button>

            <button
              v-if="order.paymentMethod === 'COD' ? ['pending','confirmed','preparing','failed'].includes(order.status) : ['pending','failed'].includes(order.status)"
              @click="cancelOrder(order._id)"
              class="btn-cancel"
            >
              Hủy
            </button>

            <button @click="goToDetail(order._id)" class="btn-detail">
              Chi tiết <span class="arrow-icon">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- PAGINATION -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="pagination.page === 1"
          @click="changePage(pagination.page - 1)"
        >
          ← Trước
        </button>

        <div class="page-numbers">
          <button
            v-for="p in pagination.totalPages"
            :key="p"
            class="page-num"
            :class="{ active: p === pagination.page }"
            @click="changePage(p)"
          >{{ p }}</button>
        </div>

        <button
          class="page-btn"
          :disabled="pagination.page === pagination.totalPages"
          @click="changePage(pagination.page + 1)"
        >
          Sau →
        </button>
      </div>

    </div>

    <!-- ══ MODAL GÁN SHIPPER ══ -->
    <teleport to="body">
      <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Gán shipper giao hàng</h3>
              <p class="modal-sub">
                Đơn <b>#{{ assignTargetOrder?._id.slice(-8).toUpperCase() }}</b>
                · {{ assignTargetOrder?.userName }}
                · {{ formatPrice(assignTargetOrder?.totalPrice) }}₫
              </p>
            </div>
            <button class="modal-close" @click="closeAssignModal">✕</button>
          </div>

          <!-- Shipper hiện tại nếu có -->
          <div v-if="assignTargetOrder?.shipperId" class="current-shipper">
            <span class="cs-label">Shipper hiện tại:</span>
            <span class="cs-name"> {{ assignTargetOrder.shipperName }}</span>
            <span class="cs-phone">{{ assignTargetOrder.shipperPhone }}</span>
          </div>

          <div v-if="shippersLoading" class="modal-loading">
            <span class="spin-lg"></span>
            <span>Đang tải danh sách shipper...</span>
          </div>

          <div v-else-if="!shippers.length" class="modal-empty">
            Không có shipper nào đang hoạt động
          </div>

          <div v-else class="shipper-list">
            <div
              v-for="s in shippers"
              :key="s._id"
              class="shipper-row"
              :class="{ 'is-current': s._id === assignTargetOrder?.shipperId }"
            >
              <div class="shipper-avatar">🛵</div>
              <div class="shipper-info">
                <span class="shipper-name">{{ s.name }}</span>
                <span class="shipper-phone">{{ s.phone }}</span>
                <span v-if="s.vehicle" class="shipper-vehicle">{{ s.vehicle }}</span>
              </div>
              <div class="shipper-right">
                <span v-if="s._id === assignTargetOrder?.shipperId" class="current-tag">Hiện tại</span>
                <button
                  class="btn-pick"
                  :disabled="assigningId === s._id"
                  @click="doAssign(s._id)"
                >
                  <span v-if="assigningId === s._id" class="spin"></span>
                  <span v-else>{{ s._id === assignTargetOrder?.shipperId ? 'Giữ lại' : 'Chọn' }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-modal-cancel" @click="closeAssignModal">Đóng</button>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import OrderService from "@/services/order.service"
import ShipperService from "@/services/shipper.service"

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, totalPages: 1 })

const pendingCount   = computed(() => orders.value.filter(o => o.status === 'pending').length)
const paidCount      = computed(() => orders.value.filter(o => o.status === 'paid').length)
const shippingCount  = computed(() => orders.value.filter(o => o.status === 'shipping').length)
const completedCount = computed(() => orders.value.filter(o => o.status === 'completed').length)

// ── Assign shipper modal ──────────────────────────────
const showAssignModal   = ref(false)
const assignTargetOrder = ref(null)
const shippers          = ref([])
const shippersLoading   = ref(false)
const assigningId       = ref(null)

const openAssignModal = async (order) => {
  assignTargetOrder.value = order
  showAssignModal.value   = true
  shippersLoading.value   = true
  try {
    const res = await ShipperService.getAllShippers()
    const list = res.data ?? res
    shippers.value = list.filter(s => s.status === "active")
  } catch {
    shippers.value = []
  } finally {
    shippersLoading.value = false
  }
}

const closeAssignModal = () => {
  showAssignModal.value   = false
  assignTargetOrder.value = null
  assigningId.value       = null
}

const doAssign = async (shipperId) => {
  assigningId.value = shipperId
  try {
    await ShipperService.assignOrder(shipperId, assignTargetOrder.value._id)
    await loadOrders(pagination.value.page)
    closeAssignModal()
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Gán shipper thất bại")
  } finally {
    assigningId.value = null
  }
}

// ── Helpers ───────────────────────────────────────────
const statusText = (s) => ({

  pending:   "Chờ",
  confirmed: "Đã xác nhận",
  paid:      "Đã thanh toán",
  preparing: "Chuẩn bị hàng",
  shipping:  "Đang giao",
  failed:    "Giao thất bại",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}[s] || s)

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v)
const formatDate  = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

const TRANSITIONS_COD = {
  pending:   ["confirmed", "preparing", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipping",  "cancelled"],
  shipping:  ["delivered", "failed"],
  failed:    ["preparing", "cancelled"],
  delivered: ["completed"],
}
const TRANSITIONS_VNPAY = {
  pending:   ["paid", "cancelled"],
  paid:      ["preparing"],
  preparing: ["shipping"],
  shipping:  ["delivered", "failed"],
  failed:    ["preparing", "cancelled"],
  delivered: ["completed"],
}
const isStatusLocked = (s) => s === 'cancelled' || s === 'completed'
const canTransitionTo = (order, newStatus) => {
  const map = order.paymentMethod === "VNPAY" ? TRANSITIONS_VNPAY : TRANSITIONS_COD
  return map[order.status]?.includes(newStatus) ?? false
}

// ── Data ──────────────────────────────────────────────
const loadOrders = async (page = 1) => {
  loading.value = true
  try {
    const res = await OrderService.getAllOrders({ page, limit: 10 })
    orders.value     = res.data
    pagination.value = res.pagination
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => router.push(`/orders/${id}`)
const changePage = (page) => loadOrders(page)

const updateStatus = async (id, newStatus) => {
  const order = orders.value.find(o => o._id === id)
  if (!order || !canTransitionTo(order, newStatus)) {
    await loadOrders(pagination.value.page)
    return
  }
  try {
    await OrderService.updateOrderStatus(id, newStatus)
    await loadOrders(pagination.value.page)
  } catch (err) { alert(err.message) }
}

const cancelOrder = async (id) => {
  if (!confirm("Xác nhận hủy đơn hàng này?")) return
  try {
    await OrderService.updateOrderStatus(id, "cancelled")
    await loadOrders(pagination.value.page)
  } catch (err) { alert(err.message) }
}

onMounted(() => loadOrders(1))
</script>

<style scoped>
.admin-orders-page {
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
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%,  rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.15); top: 40%; left: 55%; }

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
  width: 7px; height: 7px; border-radius: 50%;
  background: #f97316; box-shadow: 0 0 8px #f97316;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
.hero-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 900; color: white; line-height: 1.1; letter-spacing: -.01em;
  margin-bottom: 14px; text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: italic;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; margin-bottom: 36px; }
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
.stat-lbl { font-size: .7rem; color: rgba(255,255,255,.5); letter-spacing: .07em; text-transform: uppercase; margin-top: 3px; display: block; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.15); }

/* ══ MAIN ══ */
.main-panel {
  max-width: 1100px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: white; border-radius: 20px; padding: 16px 24px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  margin-bottom: 20px; border: 1px solid rgba(37,99,235,.1);
}
.result-info { font-size: .9rem; color: #64748b; font-weight: 500; }
.result-num { font-family: 'Times New Roman', Times, serif; font-size: 1.2rem; font-weight: 900; color: #2563eb; }
.page-info { color: #94a3b8; margin-left: 4px; }
.btn-shop {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-size: .85rem; font-weight: 700; text-decoration: none;
  box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: all .2s;
}
.btn-shop:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.shop-icon { width: 15px; height: 15px; }

/* SKELETON */
.skeleton-list { display: flex; flex-direction: column; gap: 14px; }
.skeleton-card {
  background: white; border-radius: 18px; padding: 24px 28px;
  display: flex; align-items: center; gap: 16px;
  border: 1px solid #e8edf8; animation: pulse 1.6s ease-in-out infinite; overflow: hidden;
}
.sk { background: #e8edf8; border-radius: 8px; height: 14px; }
.sk-accent { width: 5px; height: 60px; border-radius: 4px; flex-shrink: 0; }
.sk-id { width: 110px; } .sk-mid { flex: 1; } .sk-badge { width: 90px; }
.sk-btn { width: 80px; height: 32px; border-radius: 10px; }
@keyframes pulse { 0%,100%{ opacity:.6 } 50%{ opacity:1 } }

/* EMPTY */
.empty-state {
  background: white; border-radius: 24px; padding: 80px 24px;
  text-align: center; border: 1px solid #e8edf8;
  box-shadow: 0 8px 40px rgba(10,15,30,.06);
}
.empty-icon { font-size: 4rem; display: block; margin-bottom: 20px; }
.empty-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.8rem; font-weight: 700; color: #0f172a; margin: 0 0 10px;
}
.empty-desc { color: #94a3b8; margin-bottom: 32px; }
.btn-explore {
  display: inline-block; padding: 13px 32px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-weight: 700; font-size: .95rem; text-decoration: none;
  box-shadow: 0 8px 24px rgba(37,99,235,.3); transition: all .2s;
}
.btn-explore:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(37,99,235,.4); }

/* ══ ORDER CARDS ══ */
.orders-list { display: flex; flex-direction: column; gap: 14px; }
.ocard {
  background: white; border-radius: 18px; border: 1.5px solid #e8edf8;
  display: flex; align-items: center; overflow: hidden; cursor: pointer;
  transition: transform .25s cubic-bezier(.175,.885,.32,1.275), box-shadow .25s, border-color .25s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
.ocard:hover { transform: translateY(-4px) scale(1.005); box-shadow: 0 16px 40px rgba(37,99,235,.13); border-color: #a5b4fc; }

.ocard-accent { width: 5px; align-self: stretch; flex-shrink: 0; }
.accent-pending   { background: linear-gradient(180deg, #fbbf24, #f59e0b); }
.accent-confirmed { background: linear-gradient(180deg, #60a5fa, #2563eb); }
.accent-paid      { background: linear-gradient(180deg, #34d399, #059669); }
.accent-shipping  { background: linear-gradient(180deg, #c084fc, #7c3aed); }
.accent-delivered { background: linear-gradient(180deg, #34d399, #10b981); }
.accent-cancelled { background: linear-gradient(180deg, #fca5a5, #ef4444); }
.accent-preparing { background: linear-gradient(180deg, #fb923c, #ea580c); }
.accent-completed { background: linear-gradient(180deg, #4ade80, #16a34a); }
.accent-failed    { background: linear-gradient(180deg, #f87171, #dc2626); }

.ocard-body { flex: 1; padding: 18px 22px; min-width: 0; }
.ocard-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.ocard-id {
  font-family: 'Times New Roman', Times, serif;
  font-weight: 700; font-size: 1.05rem; color: #0f172a; letter-spacing: .03em;
}
.ocard-user {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .78rem; font-weight: 600; color: #64748b;
  background: #f8faff; border: 1.5px solid #e0e7ff;
  padding: 3px 10px; border-radius: 999px;
}
.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 999px;
  font-size: .7rem; font-weight: 700; letter-spacing: .04em;
}
.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.badge-pending   { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.badge-confirmed { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; }
.badge-paid      { background: #d1fae5; color: #059669; border: 1px solid #6ee7b7; }
.badge-shipping  { background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.badge-delivered { background: #d1fae5; color: #059669; border: 1px solid #a7f3d0; }
.badge-cancelled { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.badge-preparing { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
.badge-completed { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.badge-failed    { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

.payment-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 11px; border-radius: 999px;
  font-size: .7rem; font-weight: 700; letter-spacing: .04em;
}
.pay-cod   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.pay-vnpay { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.shipper-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 999px;
  font-size: .7rem; font-weight: 700;
  background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe;
}

.ocard-stats { display: flex; gap: 28px; flex-wrap: wrap; }
.ostat { display: flex; flex-direction: column; gap: 2px; }
.ostat-lbl { font-size: .68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
.ostat-val { font-size: .9rem; font-weight: 600; color: #334155; }
.ostat-val.price { font-family: 'Times New Roman', Times, serif; font-size: 1rem; font-weight: 700; color: #e11d48; }
.ostat-val.date { font-size: .8rem; color: #94a3b8; }

/* ACTIONS */
.ocard-actions {
  display: flex; flex-direction: column; gap: 8px;
  padding: 18px 18px 18px 0; flex-shrink: 0;
}
.status-select {
  padding: 7px 10px; border-radius: 10px;
  border: 1.5px solid #e0e7ff; font-size: .78rem; font-weight: 700;
  background: #f8faff; cursor: pointer; outline: none;
  transition: border-color .2s, background .2s;
  appearance: none; text-align: center;
}
.status-select:focus { border-color: #a5b4fc; background: #eff6ff; }
.status-select:disabled { opacity: .5; cursor: not-allowed; background: #f1f5f9; }
.select-pending   { color: #d97706; border-color: #fde68a; background: #fffbeb; }
.select-confirmed { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
.select-paid      { color: #059669; border-color: #6ee7b7; background: #f0fdf4; }
.select-shipping  { color: #7c3aed; border-color: #ddd6fe; background: #f5f3ff; }
.select-delivered { color: #059669; border-color: #a7f3d0; background: #f0fdf4; }
.select-cancelled { color: #dc2626; border-color: #fecaca; background: #fff1f2; }
.select-preparing { color: #ea580c; border-color: #fed7aa; background: #fff7ed; }
.select-completed { color: #16a34a; border-color: #bbf7d0; background: #f0fdf4; }
.select-failed    { color: #b91c1c; border-color: #fecaca; background: #fef2f2; }

.btn-assign {
  padding: 7px 14px; border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: none; color: white;
  font-size: .78rem; font-weight: 700; cursor: pointer;
  transition: all .2s; white-space: nowrap;
  box-shadow: 0 3px 10px rgba(124,58,237,.3);
}
.btn-assign:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(124,58,237,.4); }

.btn-cancel {
  padding: 7px 14px; border-radius: 10px;
  background: #fee2e2; border: 1px solid #fecaca;
  color: #dc2626; font-size: .78rem; font-weight: 700;
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.btn-cancel:hover { background: #fecaca; border-color: #fca5a5; }
.btn-detail {
  padding: 7px 14px; border-radius: 10px;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .78rem; font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
  transition: all .2s; white-space: nowrap;
}
.btn-detail:hover { background: linear-gradient(135deg, #dbeafe, #ede9fe); border-color: #c7d2fe; }
.arrow-icon { display: inline-block; transition: transform .2s; }
.btn-detail:hover .arrow-icon { transform: translateX(3px); }

/* PAGINATION */
.pagination { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 28px; }
.page-btn {
  padding: 9px 20px; border-radius: 12px;
  background: white; border: 1.5px solid #e0e7ff;
  color: #4f46e5; font-weight: 700; font-size: .85rem;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 2px 10px rgba(37,99,235,.07);
}
.page-btn:hover:not(:disabled) { background: #eff6ff; transform: translateY(-1px); }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 6px; }
.page-num {
  width: 36px; height: 36px; border-radius: 10px;
  background: white; border: 1.5px solid #e0e7ff;
  color: #64748b; font-weight: 700; font-size: .85rem;
  cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center;
}
.page-num:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.page-num.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; border-color: transparent;
  box-shadow: 0 4px 14px rgba(37,99,235,.35);
}

/* ══ MODAL ══ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,15,30,.65); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: 24px; width: 100%; max-width: 480px;
  box-shadow: 0 32px 80px rgba(0,0,0,.35); overflow: hidden;
  animation: modalIn .25s cubic-bezier(.175,.885,.32,1.275);
}
@keyframes modalIn { from { opacity:0; transform:scale(.92) translateY(16px); } to { opacity:1; transform:none; } }

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1.5px solid #f0f4ff;
  background: linear-gradient(135deg, #f8faff, #f5f3ff);
}
.modal-title { font-size: 1.1rem; font-weight: 900; color: #0f172a; margin: 0 0 5px; }
.modal-sub { font-size: .78rem; color: #64748b; margin: 0; }
.modal-close {
  background: #f1f5f9; border: none; color: #64748b;
  width: 30px; height: 30px; border-radius: 50%; font-size: .85rem;
  cursor: pointer; transition: all .2s; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #fee2e2; color: #dc2626; }

.current-shipper {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 24px; background: #f5f3ff; border-bottom: 1.5px solid #ede9fe;
  font-size: .78rem;
}
.cs-label { color: #94a3b8; font-weight: 600; }
.cs-name  { font-weight: 700; color: #7c3aed; }
.cs-phone { color: #64748b; }

.modal-loading {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 40px; color: #94a3b8; font-size: .85rem;
}
.modal-empty { padding: 40px; text-align: center; color: #94a3b8; font-weight: 600; font-size: .9rem; }

.shipper-list { display: flex; flex-direction: column; max-height: 340px; overflow-y: auto; }
.shipper-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 24px; border-bottom: 1.5px solid #f8faff;
  transition: background .15s;
}
.shipper-row:last-child { border-bottom: none; }
.shipper-row:hover { background: #f8faff; }
.shipper-row.is-current { background: #faf5ff; }

.shipper-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg, #ede9fe, #dbeafe);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.15rem; flex-shrink: 0;
}
.shipper-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.shipper-name { font-weight: 700; font-size: .88rem; color: #0f172a; }
.shipper-phone { font-size: .73rem; color: #64748b; }
.shipper-vehicle {
  display: inline-block; font-size: .65rem; color: #7c3aed;
  background: #f3e8ff; border: 1px solid #ddd6fe;
  padding: 1px 7px; border-radius: 999px; width: fit-content; margin-top: 2px;
}
.shipper-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.current-tag {
  font-size: .62rem; font-weight: 700; color: #7c3aed;
  background: #ede9fe; border: 1px solid #ddd6fe;
  padding: 2px 7px; border-radius: 999px;
}
.btn-pick {
  padding: 7px 18px; border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none; color: white;
  font-size: .78rem; font-weight: 700; cursor: pointer;
  transition: all .2s; min-width: 64px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(79,70,229,.3);
}
.btn-pick:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(79,70,229,.4); }
.btn-pick:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.modal-footer {
  padding: 14px 24px;
  border-top: 1.5px solid #f0f4ff;
  display: flex; justify-content: flex-end;
  background: #fafbff;
}
.btn-modal-cancel {
  padding: 9px 24px; border-radius: 10px;
  background: #f1f5f9; border: 1.5px solid #e0e7ff;
  color: #64748b; font-size: .85rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
}
.btn-modal-cancel:hover { background: #e0e7ff; color: #4f46e5; }

/* Spinners */
.spin {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
  border-radius: 50%; animation: spinning .6s linear infinite; display: inline-block;
}
.spin-lg {
  width: 20px; height: 20px;
  border: 2px solid #e0e7ff; border-top-color: #4f46e5;
  border-radius: 50%; animation: spinning .6s linear infinite; display: inline-block;
}
@keyframes spinning { to { transform: rotate(360deg); } }

/* MOBILE */
@media (max-width: 768px) {
  .ocard { flex-direction: column; align-items: stretch; }
  .ocard-accent { width: auto; height: 5px; }
  .ocard-actions { flex-direction: row; flex-wrap: wrap; padding: 0 16px 16px; }
  .ocard-stats { gap: 16px; }
  .hero-stats { gap: 14px; padding: 14px 18px; }
}
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .main-panel { padding: 0 14px 40px; }
}
</style>