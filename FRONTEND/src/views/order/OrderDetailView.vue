<template>
  <div class="order-detail-page">

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

        <h1 class="hero-title" v-if="order">
          Đơn <em>#{{ order._id.slice(-8).toUpperCase() }}</em>
        </h1>
        <h1 class="hero-title" v-else>
          Chi tiết <em>đơn hàng</em>
        </h1>

        <p class="hero-sub">Thông tin đầy đủ · Sản phẩm · Cập nhật trạng thái</p>

        <div class="hero-stats" v-if="order && !loading">
          <div class="hero-stat">
            <span class="stat-num">{{ order.totalQuantity }}</span>
            <span class="stat-lbl">Sản phẩm</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num price-stat">{{ formatPrice(order.totalPrice) }}₫</span>
            <span class="stat-lbl">Tổng tiền</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="status-pill-hero" :class="`pill-${order.status}`">
              {{ getStatusLabel(order.status) }}
            </span>
            <span class="stat-lbl">Trạng thái</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN ══ -->
    <div class="main-panel">

      <!-- Back button -->
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Quay lại danh sách
      </button>

      <!-- LOADING -->
      <div v-if="loading" class="skeleton-wrap">
        <div class="sk-block sk-tall"></div>
        <div class="sk-block sk-short"></div>
        <div class="sk-block sk-tall"></div>
      </div>

      <!-- NOT FOUND -->
      <div v-else-if="!order" class="not-found">
        <div class="nf-icon">❌</div>
        <h2 class="nf-title">Đơn hàng không tồn tại</h2>
        <p class="nf-desc">Mã đơn hàng không hợp lệ hoặc đã bị xóa</p>
        <router-link to="/admin/orders" class="btn-back-orders">← Về danh sách đơn</router-link>
      </div>

      <!-- CONTENT -->
      <div v-else class="detail-layout">

        <!-- LEFT COL -->
        <div class="left-col">

          <!-- Info card -->
          <div class="info-card">
            <div class="card-header">
              <span class="card-icon">📋</span>
              <h2 class="card-title">Thông tin đơn hàng</h2>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-lbl">Mã đơn hàng</span>
                <span class="info-val mono">#{{ order._id.slice(-8).toUpperCase() }}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Người đặt</span>
                <span class="info-val">{{ order.userName }}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Số điện thoại</span>
                <span class="info-val">{{ order.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Ngày đặt</span>
                <span class="info-val date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Thanh toán</span>
                <span class="info-val">
                  <span class="payment-badge" :class="order.paymentMethod === 'VNPAY' ? 'pay-vnpay' : 'pay-cod'">
                    {{ order.paymentMethod === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'THANH TOÁN COD' }}
                  </span>
                </span>
              </div>
              <div class="info-item full">
                <span class="info-lbl">Địa chỉ giao hàng</span>
                <span class="info-val">{{ order.shippingAddress }}</span>
              </div>
              <div v-if="order.note" class="info-item full">
                <span class="info-lbl">Ghi chú</span>
                <span class="info-val note">{{ order.note }}</span>
              </div>
            </div>
          </div>

          <!-- Admin controls card -->
          <div class="admin-card">
            <div class="card-header">
              <span class="card-icon">⚙️</span>
              <h2 class="card-title">Quản lý đơn hàng</h2>
            </div>

            <div class="admin-body">
              <!-- Cập nhật trạng thái -->
              <div class="admin-field">
                <label class="admin-lbl">Cập nhật trạng thái</label>
                <select
                  v-model="order.status"
                  @change="updateStatus(order._id, order.status)"
                  class="status-select"
                  :class="`select-${order.status}`"
                  :disabled="isStatusLocked(order.status)"
                >
                  <option value="pending">🕐 Chờ xác nhận</option>
                  <option value="confirmed">✅ Đã xác nhận</option>
                  <option value="paid">💳 Đã thanh toán</option>
                  <option value="preparing">📦 Chuẩn bị hàng</option>
                  <option value="shipping">🚚 Đang giao</option>
                  <option value="delivered">📬 Đã giao</option>
                  <option value="completed">🎉 Hoàn thành</option>
                  <option value="cancelled">❌ Đã hủy</option>
                </select>
                <p v-if="isStatusLocked(order.status)" class="locked-note">
                  🔒 Đơn hàng đã khóa, không thể thay đổi trạng thái
                </p>
              </div>

              <!-- Gán shipper — chỉ hiện khi confirmed và paid-->
              <div v-if="order.status === 'preparing'" class="admin-field">
  <label class="admin-lbl">Shipper giao hàng</label>

                <!-- Đã có shipper -->
                <div v-if="order.shipperId" class="assigned-box">
                  <div class="assigned-avatar"></div>
                  <div class="assigned-info">
                    <span class="assigned-name">{{ order.shipperName }}</span>
                    <span class="assigned-phone">{{ order.shipperPhone }}</span>
                  </div>
                  <button class="btn-reassign" @click="openAssignModal">Đổi shipper</button>
                </div>

                <!-- Chưa có shipper -->
                <button v-else class="btn-assign-shipper" @click="openAssignModal">
                  Gán shipper giao hàng
                </button>
              </div>

              <!-- Hiển thị shipper nếu đang shipping -->
              <div v-if="order.status === 'shipping' && order.shipperId" class="admin-field">
                <label class="admin-lbl">Shipper đang giao</label>
                <div class="assigned-box assigned-box--shipping">
                  <div class="assigned-avatar"></div>
                  <div class="assigned-info">
                    <span class="assigned-name">{{ order.shipperName }}</span>
                    <span class="assigned-phone">{{ order.shipperPhone }}</span>
                  </div>
                  <span class="shipping-tag">Đang giao</span>
                </div>
              </div>

              <button
                v-if="order.paymentMethod === 'COD' ? ['pending','confirmed','preparing'].includes(order.status) : order.status === 'pending'"
                @click="confirmCancel(order._id)"
                class="btn-cancel-order"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
                Hủy đơn hàng
              </button>
            </div>
          </div>

          <!-- Timeline -->
          <div class="timeline-card">
            <div class="card-header">
              <span class="card-icon">🚀</span>
              <h2 class="card-title">Tiến trình đơn hàng</h2>
            </div>

            <div class="timeline">
              <div
                v-for="step in currentStatusSteps"
                :key="step.key"
                class="timeline-step"
                :class="{
                  active: isStepActive(step.key),
                  current: order.status === step.key,
                  cancelled: order.status === 'cancelled'
                }"
              >
                <div class="step-dot">
                  <span class="step-ico">{{ step.icon }}</span>
                </div>
                <div class="step-line" v-if="step.key !== 'completed'"></div>
                <div class="step-info">
                  <span class="step-name">{{ step.label }}</span>
                </div>
              </div>
            </div>

            <div v-if="order.status === 'cancelled'" class="cancelled-notice">
              <span>❌</span>
              <span>Đơn hàng này đã bị hủy</span>
            </div>
          </div>

        </div>

        <!-- RIGHT COL -->
        <div class="right-col">
          <div class="products-card">
            <div class="card-header">
              <span class="card-icon">🛍️</span>
              <h2 class="card-title">Sản phẩm ({{ order.items.length }})</h2>
            </div>

            <div class="product-list">
              <div
                v-for="item in order.items"
                :key="item.productId"
                class="product-row"
              >
                <div class="product-img-wrap">
                  <img :src="item.images?.[0] || placeholder" class="product-img" />
                </div>
                <div class="product-info">
                  <h4 class="product-name">{{ item.name }}</h4>
                  <div class="product-meta">
                    <span class="product-qty">x{{ item.quantity }}</span>
                    <span class="product-price-unit">{{ formatPrice(item.price) }}₫/cái</span>
                  </div>
                </div>
                <div class="product-total">
                  <span class="total-lbl">Thành tiền</span>
                  <span class="total-val">{{ formatPrice(item.price * item.quantity) }}₫</span>
                </div>
              </div>
            </div>

            <div class="order-summary">
              <div class="summary-row">
                <span>Tổng số lượng</span>
                <b>{{ order.totalQuantity }} sản phẩm</b>
              </div>
              <div class="summary-row">
                <span>Tạm tính</span>
                <span>{{ formatPrice(order.originalPrice) }}₫</span>
              </div>
              <template v-if="order.discount > 0">
                <div class="summary-row discount-row">
                  <span>Giảm giá ({{ order.pointsUsed }} điểm)</span>
                  <span class="discount-val">-{{ formatPrice(order.discount) }}₫</span>
                </div>
              </template>
              <div class="summary-divider"></div>
              <div class="summary-row total">
                <span>Khách trả</span>
                <span class="summary-price">{{ formatPrice(order.totalPrice) }}₫</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══ MODAL GÁN SHIPPER ══ -->
    <teleport to="body">
      <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Gán shipper giao hàng</h3>
              <p class="modal-sub" v-if="order">
                Đơn <b>#{{ order._id.slice(-8).toUpperCase() }}</b>
                · {{ order.userName }}
              </p>
            </div>
            <button class="modal-close" @click="closeAssignModal">✕</button>
          </div>

          <!-- Shipper hiện tại -->
          <div v-if="order?.shipperId" class="current-shipper">
            <span class="cs-label">Hiện tại:</span>
            <span class="cs-name">{{ order.shipperName }}</span>
            <span class="cs-phone">{{ order.shipperPhone }}</span>
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
              :class="{ 'is-current': s._id === order?.shipperId }"
            >
              <div class="shipper-avatar"></div>
              <div class="shipper-info">
                <span class="shipper-name">{{ s.name }}</span>
                <span class="shipper-phone">{{ s.phone }}</span>
                <span v-if="s.vehicle" class="shipper-vehicle">{{ s.vehicle }}</span>
              </div>
              <div class="shipper-right">
                <span v-if="s._id === order?.shipperId" class="current-tag">Hiện tại</span>
                <button
                  class="btn-pick"
                  :disabled="assigningId === s._id"
                  @click="doAssign(s._id)"
                >
                  <span v-if="assigningId === s._id" class="spin"></span>
                  <span v-else>{{ s._id === order?.shipperId ? 'Giữ lại' : 'Chọn' }}</span>
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
import { useRoute, useRouter } from "vue-router"
import OrderService from "@/services/order.service"
import ShipperService from "@/services/shipper.service"

const route = useRoute()
const router = useRouter()

const order   = ref(null)
const loading = ref(true)
const placeholder = "https://via.placeholder.com/120x160?text=No+Image"

// ── Steps timeline ────────────────────────────────────
const codSteps = [
  { key: "pending",   label: "Chờ xác nhận",  icon: "🕐" },
  { key: "confirmed", label: "Đã xác nhận",   icon: "✅" },
  { key: "preparing", label: "Chuẩn bị hàng", icon: "📦" },
  { key: "shipping",  label: "Đang giao",     icon: "🚚" },
  { key: "delivered", label: "Đã giao",       icon: "📬" },
  { key: "completed", label: "Hoàn thành",    icon: "🎉" },
]
const vnpaySteps = [
  { key: "pending",   label: "Chờ thanh toán", icon: "🕐" },
  { key: "paid",      label: "Đã thanh toán",  icon: "💳" },
  { key: "preparing", label: "Chuẩn bị hàng",  icon: "📦" },
  { key: "shipping",  label: "Đang giao",      icon: "🚚" },
  { key: "delivered", label: "Đã giao",        icon: "📬" },
  { key: "completed", label: "Hoàn thành",     icon: "🎉" },
]
const codOrder   = ["pending", "confirmed", "preparing", "shipping", "delivered", "completed"]
const vnpayOrder = ["pending", "paid",      "preparing", "shipping", "delivered", "completed"]

const currentStatusSteps = computed(() =>
  order.value?.paymentMethod === "VNPAY" ? vnpaySteps : codSteps
)
const isStepActive = (key) => {
  if (order.value?.status === "cancelled") return false
  const orderArr = order.value?.paymentMethod === "VNPAY" ? vnpayOrder : codOrder
  return orderArr.indexOf(key) <= orderArr.indexOf(order.value?.status)
}

// ── Assign shipper modal ──────────────────────────────
const showAssignModal = ref(false)
const shippers        = ref([])
const shippersLoading = ref(false)
const assigningId     = ref(null)

const openAssignModal = async () => {
  showAssignModal.value = true
  shippersLoading.value = true
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
  showAssignModal.value = false
  assigningId.value     = null
}

const doAssign = async (shipperId) => {
  assigningId.value = shipperId
  try {
    await ShipperService.assignOrder(shipperId, order.value._id)
    await loadOrder()
    closeAssignModal()
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Gán shipper thất bại")
  } finally {
    assigningId.value = null
  }
}

// ── Helpers ───────────────────────────────────────────
const isStatusLocked = (s) => s === "cancelled" || s === "completed"
const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v)
const formatDate  = d =>
  new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
const getStatusLabel = (s) => ({
  pending:   "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  paid:      "Đã thanh toán",
  preparing: "Chuẩn bị hàng",
  shipping:  "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}[s] || s)

// ── Data ──────────────────────────────────────────────
const loadOrder = async () => {
  loading.value = true
  try {
    order.value = await OrderService.getOrder(route.params.orderId)
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const updateStatus = async (id, status) => {
  try {
    await OrderService.updateOrderStatus(id, status)
    await loadOrder()
  } catch (err) { alert(err.message) }
}

const confirmCancel = (id) => {
  if (confirm("Xác nhận hủy đơn hàng này?")) cancelOrder(id)
}
const cancelOrder = async (id) => {
  try {
    await OrderService.updateOrderStatus(id, "cancelled")
    await loadOrder()
  } catch (err) { alert(err.message) }
}

onMounted(loadOrder)
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 64px 32px 80px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%,  rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3),  transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%,  rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(249,115,22,.12); top: 40%; left: 55%; }
.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 20px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #f97316; box-shadow: 0 0 8px #f97316;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.5); } }
.hero-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 900; color: white; line-height: 1.1;
  letter-spacing: -.01em; margin-bottom: 12px;
}
.hero-title em {
  font-style: italic;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.5); letter-spacing: .06em; margin-bottom: 32px; }
.hero-stats {
  display: inline-flex; align-items: center; gap: 24px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 16px 28px; backdrop-filter: blur(16px);
}
.hero-stat { text-align: center; }
.stat-num { display: block; font-size: 1.5rem; font-weight: 900; color: white; line-height: 1; }
.stat-num.price-stat { font-size: 1rem; color: #fb923c; }
.stat-lbl { font-size: .68rem; color: rgba(255,255,255,.45); letter-spacing: .07em; text-transform: uppercase; margin-top: 4px; display: block; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.15); }
.status-pill-hero {
  display: inline-block; padding: 4px 12px; border-radius: 999px;
  font-size: .75rem; font-weight: 700; letter-spacing: .04em; margin-bottom: 2px;
}
.pill-pending   { background: #fef3c7; color: #d97706; }
.pill-confirmed { background: #dbeafe; color: #2563eb; }
.pill-paid      { background: #d1fae5; color: #059669; }
.pill-shipping  { background: #f3e8ff; color: #7c3aed; }
.pill-delivered { background: #d1fae5; color: #059669; }
.pill-cancelled { background: #fee2e2; color: #dc2626; }
.pill-preparing { background: #fff7ed; color: #ea580c; }
.pill-completed { background: #f0fdf4; color: #16a34a; }

/* ══ MAIN ══ */
.main-panel {
  max-width: 1200px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: 12px;
  background: white; border: 1.5px solid #e0e7ff;
  color: #4f46e5; font-weight: 700; font-size: .85rem;
  cursor: pointer; margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(37,99,235,.08); transition: all .2s;
}
.back-btn:hover { background: #eff6ff; transform: translateX(-3px); }

/* SKELETON */
.skeleton-wrap { display: flex; flex-direction: column; gap: 16px; }
.sk-block { background: white; border-radius: 20px; animation: pulse 1.5s ease-in-out infinite; border: 1.5px solid #e8edf8; }
.sk-tall { height: 200px; } .sk-short { height: 100px; }
@keyframes pulse { 0%,100%{opacity:.7} 50%{opacity:1} }

/* NOT FOUND */
.not-found {
  background: white; border-radius: 24px; padding: 80px 24px;
  text-align: center; border: 1.5px solid #e8edf8;
  box-shadow: 0 12px 40px rgba(37,99,235,.08);
}
.nf-icon { font-size: 5rem; display: block; margin-bottom: 16px; }
.nf-title { font-size: 1.6rem; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
.nf-desc { color: #94a3b8; margin-bottom: 24px; }
.btn-back-orders {
  display: inline-block; padding: 12px 28px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white;
  font-weight: 700; box-shadow: 0 6px 20px rgba(37,99,235,.3); transition: all .2s;
}
.btn-back-orders:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,.4); }

/* ══ LAYOUT ══ */
.detail-layout { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; }

/* ══ SHARED CARD ══ */
.info-card, .admin-card, .timeline-card, .products-card {
  background: white; border-radius: 22px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(37,99,235,.07);
  overflow: hidden;
}
.card-header {
  display: flex; align-items: center; gap: 10px;
  padding: 20px 24px 16px; border-bottom: 1.5px solid #f0f4ff;
}
.card-icon { font-size: 1.3rem; }
.card-title { font-weight: 900; font-size: 1rem; color: #0f172a; }

/* ══ INFO CARD ══ */
.info-card { margin-bottom: 16px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 4px 0; }
.info-item { padding: 14px 24px; border-bottom: 1.5px solid #f8faff; display: flex; flex-direction: column; gap: 4px; }
.info-item.full { grid-column: 1 / -1; }
.info-lbl { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
.info-val { font-size: .9rem; font-weight: 600; color: #0f172a; }
.info-val.mono { font-family: monospace; color: #2563eb; font-size: 1rem; }
.info-val.date { color: #64748b; }
.info-val.note { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 8px; padding: 8px 10px; color: #92400e; font-size: .82rem; }
.payment-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 11px; border-radius: 999px; font-size: .75rem; font-weight: 700; }
.pay-cod   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.pay-vnpay { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

/* ══ ADMIN CARD ══ */
.admin-card { margin-bottom: 16px; border-color: #e0e7ff; }
.admin-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.admin-field { display: flex; flex-direction: column; gap: 8px; }
.admin-lbl { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }

.status-select {
  width: 100%; padding: 10px 14px; border-radius: 12px;
  border: 1.5px solid #e0e7ff; font-size: .88rem; font-weight: 700;
  background: #f8faff; cursor: pointer; outline: none;
  transition: border-color .2s, background .2s;
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

.locked-note { font-size: .75rem; color: #94a3b8; font-weight: 500; background: #f8faff; border: 1px solid #e0e7ff; padding: 8px 12px; border-radius: 8px; }

/* Assigned shipper box */
.assigned-box {
  display: flex; align-items: center; gap: 10px;
  background: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: 12px; padding: 10px 14px;
}
.assigned-box--shipping { background: #f0fdf4; border-color: #6ee7b7; }
.assigned-avatar { font-size: 1.4rem; flex-shrink: 0; }
.assigned-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.assigned-name { font-weight: 700; font-size: .88rem; color: #4f46e5; }
.assigned-box--shipping .assigned-name { color: #059669; }
.assigned-phone { font-size: .73rem; color: #7c3aed; }
.assigned-box--shipping .assigned-phone { color: #10b981; }
.btn-reassign {
  padding: 6px 12px; border-radius: 8px; flex-shrink: 0;
  background: white; border: 1.5px solid #ddd6fe;
  color: #7c3aed; font-size: .73rem; font-weight: 700; cursor: pointer; transition: all .2s;
}
.btn-reassign:hover { background: #ede9fe; }
.shipping-tag {
  font-size: .68rem; font-weight: 700; color: #059669;
  background: #d1fae5; border: 1px solid #6ee7b7;
  padding: 3px 9px; border-radius: 999px; flex-shrink: 0;
}

.btn-assign-shipper {
  width: 100%; padding: 11px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white; font-size: .88rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 4px 14px rgba(124,58,237,.3);
}
.btn-assign-shipper:hover { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(124,58,237,.4); }

.btn-cancel-order {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 12px; border-radius: 12px; font-weight: 700; font-size: .88rem;
  background: #fee2e2; border: 1.5px solid #fecaca; color: #dc2626; cursor: pointer; transition: all .2s;
}
.btn-cancel-order:hover { background: #fecaca; border-color: #fca5a5; }

/* ══ TIMELINE ══ */
.timeline { display: flex; align-items: flex-start; padding: 24px 20px 20px; gap: 0; }
.timeline-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.step-dot {
  width: 40px; height: 40px; border-radius: 50%;
  background: #f0f4ff; border: 2px solid #e0e7ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; transition: all .3s; z-index: 1;
}
.timeline-step.active .step-dot { background: linear-gradient(135deg, #2563eb, #4f46e5); border-color: #2563eb; box-shadow: 0 4px 14px rgba(37,99,235,.35); }
.timeline-step.current .step-dot {
  background: linear-gradient(135deg, #10b981, #059669); border-color: #10b981;
  box-shadow: 0 4px 14px rgba(16,185,129,.4); animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot { 0%,100% { box-shadow: 0 4px 14px rgba(16,185,129,.4); } 50% { box-shadow: 0 4px 24px rgba(16,185,129,.7); } }
.timeline-step.cancelled .step-dot { background: #f1f5f9; border-color: #e2e8f0; }
.step-line { position: absolute; top: 20px; left: 60%; width: calc(100% - 20px); height: 2px; background: #e0e7ff; z-index: 0; }
.timeline-step.active .step-line { background: linear-gradient(90deg, #2563eb, #4f46e5); }
.step-info { margin-top: 8px; text-align: center; }
.step-name { font-size: .65rem; font-weight: 700; color: #94a3b8; letter-spacing: .04em; }
.timeline-step.active .step-name { color: #2563eb; }
.timeline-step.current .step-name { color: #10b981; }
.cancelled-notice {
  margin: 0 24px 20px; display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 12px;
  background: #fee2e2; border: 1.5px solid #fecaca; color: #dc2626; font-weight: 700; font-size: .85rem;
}

/* ══ PRODUCTS CARD ══ */
.product-list { display: flex; flex-direction: column; }
.product-row { display: flex; align-items: center; gap: 16px; padding: 16px 24px; border-bottom: 1.5px solid #f8faff; transition: background .2s; }
.product-row:last-child { border-bottom: none; }
.product-row:hover { background: #f8faff; }
.product-img-wrap { flex-shrink: 0; }
.product-img { width: 70px; height: 88px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.1); transition: transform .3s; }
.product-row:hover .product-img { transform: scale(1.05); }
.product-info { flex: 1; }
.product-name { font-weight: 700; font-size: .92rem; color: #0f172a; line-height: 1.3; margin-bottom: 8px; }
.product-meta { display: flex; align-items: center; gap: 10px; }
.product-qty { display: inline-block; padding: 3px 10px; border-radius: 999px; background: #eff6ff; border: 1.5px solid #bfdbfe; color: #2563eb; font-size: .72rem; font-weight: 700; }
.product-price-unit { font-size: .78rem; color: #94a3b8; }
.product-total { text-align: right; flex-shrink: 0; min-width: 100px; }
.total-lbl { display: block; font-size: .65rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
.total-val { font-weight: 900; font-size: 1rem; color: #e11d48; }
.order-summary { padding: 20px 24px; background: linear-gradient(135deg, #f8faff, #f5f3ff); border-top: 1.5px solid #e0e7ff; display: flex; flex-direction: column; gap: 12px; }
.summary-row { display: flex; justify-content: space-between; align-items: center; font-size: .9rem; color: #475569; }
.summary-divider { height: 1.5px; background: linear-gradient(90deg, #e0e7ff, #ddd6fe); border-radius: 999px; }
.summary-row.total { font-size: 1rem; font-weight: 800; color: #0f172a; }
.summary-price { color: #f97316; font-size: 1.3rem; font-weight: 900; }

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
  padding: 24px 24px 16px; border-bottom: 1.5px solid #f0f4ff;
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
  padding: 10px 24px; background: #f5f3ff; border-bottom: 1.5px solid #ede9fe; font-size: .78rem;
}
.cs-label { color: #94a3b8; font-weight: 600; }
.cs-name  { font-weight: 700; color: #7c3aed; }
.cs-phone { color: #64748b; }
.modal-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 40px; color: #94a3b8; font-size: .85rem; }
.modal-empty { padding: 40px; text-align: center; color: #94a3b8; font-weight: 600; font-size: .9rem; }
.shipper-list { display: flex; flex-direction: column; max-height: 340px; overflow-y: auto; }
.shipper-row { display: flex; align-items: center; gap: 12px; padding: 14px 24px; border-bottom: 1.5px solid #f8faff; transition: background .15s; }
.shipper-row:last-child { border-bottom: none; }
.shipper-row:hover { background: #f8faff; }
.shipper-row.is-current { background: #faf5ff; }
.shipper-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #ede9fe, #dbeafe); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0; }
.shipper-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.shipper-name { font-weight: 700; font-size: .88rem; color: #0f172a; }
.shipper-phone { font-size: .73rem; color: #64748b; }
.shipper-vehicle { display: inline-block; font-size: .65rem; color: #7c3aed; background: #f3e8ff; border: 1px solid #ddd6fe; padding: 1px 7px; border-radius: 999px; width: fit-content; margin-top: 2px; }
.shipper-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.current-tag { font-size: .62rem; font-weight: 700; color: #7c3aed; background: #ede9fe; border: 1px solid #ddd6fe; padding: 2px 7px; border-radius: 999px; }
.btn-pick {
  padding: 7px 18px; border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none; color: white; font-size: .78rem; font-weight: 700; cursor: pointer;
  transition: all .2s; min-width: 64px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(79,70,229,.3);
}
.btn-pick:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(79,70,229,.4); }
.btn-pick:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.modal-footer { padding: 14px 24px; border-top: 1.5px solid #f0f4ff; display: flex; justify-content: flex-end; background: #fafbff; }
.btn-modal-cancel { padding: 9px 24px; border-radius: 10px; background: #f1f5f9; border: 1.5px solid #e0e7ff; color: #64748b; font-size: .85rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.btn-modal-cancel:hover { background: #e0e7ff; color: #4f46e5; }

/* Spinners */
.spin { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spinning .6s linear infinite; display: inline-block; }
.spin-lg { width: 20px; height: 20px; border: 2px solid #e0e7ff; border-top-color: #4f46e5; border-radius: 50%; animation: spinning .6s linear infinite; display: inline-block; }
@keyframes spinning { to { transform: rotate(360deg); } }

/* ══ MOBILE ══ */
@media (max-width: 900px) { .detail-layout { grid-template-columns: 1fr; } }
@media (max-width: 640px) {
  .hero { padding: 48px 16px 60px; }
  .hero-stats { gap: 14px; padding: 12px 18px; }
  .main-panel { padding: 0 12px 40px; }
  .info-grid { grid-template-columns: 1fr; }
  .step-name { font-size: .58rem; }
}
.discount-row { color: #059669; }
.discount-val { font-weight: 700; color: #059669; }
</style>