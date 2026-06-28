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
          Quản lý đơn hàng
        </div>

        <h1 class="hero-title" v-if="order">
          Đơn <em>#{{ order._id.slice(-8).toUpperCase() }}</em>
        </h1>
        <h1 class="hero-title" v-else>
          Chi tiết <em>đơn hàng</em>
        </h1>

        <p class="hero-sub">Thông tin đầy đủ · Sản phẩm · Trạng thái</p>

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
            <span class="stat-num">
              <span class="status-pill-hero" :class="`pill-${order.status}`">
                {{ getStatusLabel(order.status) }}
              </span>
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
        <router-link to="/orders" class="btn-back-orders">← Về danh sách đơn</router-link>
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

              <!-- Phương thức thanh toán -->
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
              <div v-if="order.shipperName" class="info-item full">
  <span class="info-lbl">Shipper giao hàng</span>
  <span class="info-val shipper-val">
    🛵 {{ order.shipperName }}
    <span class="shipper-phone">{{ order.shipperPhone }}</span>
  </span>
</div>
            </div>
          </div>

          <!-- Status timeline -->
          <div class="timeline-card">
            <div class="card-header">
              <span class="card-icon">🚀</span>
              <h2 class="card-title">Trạng thái đơn hàng</h2>
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

            <!-- Failed special state -->
            <div v-if="order.status === 'failed'" class="failed-notice">
              <span>⚠️</span>
              <span>Giao hàng thất bại — shop đang sắp xếp giao lại</span>
            </div>

            <!-- Cancelled special state -->
            <div v-if="order.status === 'cancelled'" class="cancelled-notice">
              <span>❌</span>
              <span>Đơn hàng này đã bị hủy</span>
            </div>
          </div>

        </div>

        <!-- RIGHT COL: Products -->
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

            <!-- Summary -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import OrderService from "@/services/order.service"

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)
const placeholder = "https://via.placeholder.com/120x160?text=No+Image"

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

// Dùng paymentMethod để chọn đúng bộ steps
const currentStatusSteps = computed(() =>
  order.value?.paymentMethod === "VNPAY" ? vnpaySteps : codSteps
)

const codOrder   = ["pending", "confirmed", "preparing", "shipping", "delivered", "completed"]
const vnpayOrder = ["pending", "paid",      "preparing", "shipping", "delivered", "completed"]

// Dùng paymentMethod để chọn đúng orderArr
const isStepActive = (key) => {
  if (order.value?.status === "cancelled") return false
  const orderArr = order.value?.paymentMethod === "VNPAY" ? vnpayOrder : codOrder
  const cur  = orderArr.indexOf(order.value?.status)
  const step = orderArr.indexOf(key)
  return step <= cur
}

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v)
const formatDate = d =>
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
  failed:    "Giao thất bại",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}[s] || s)

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
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
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
  margin-bottom: 20px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 8px #10b981;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
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
  font-size: .75rem; font-weight: 700; letter-spacing: .04em;
}
.pill-pending   { background: #fef3c7; color: #d97706; }
.pill-confirmed { background: #dbeafe; color: #2563eb; }
.pill-paid      { background: #d1fae5; color: #059669; }
.pill-shipping  { background: #f3e8ff; color: #7c3aed; }
.pill-delivered { background: #d1fae5; color: #059669; }
.pill-cancelled { background: #fee2e2; color: #dc2626; }
.pill-preparing { background: #fff7ed; color: #ea580c; }
.pill-completed { background: #f0fdf4; color: #16a34a; }
.pill-failed    { background: #fef2f2; color: #b91c1c; }

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
  box-shadow: 0 4px 16px rgba(37,99,235,.08);
  transition: all .2s;
}
.back-btn:hover { background: #eff6ff; transform: translateX(-3px); }

/* SKELETON */
.skeleton-wrap { display: flex; flex-direction: column; gap: 16px; }
.sk-block {
  background: white; border-radius: 20px;
  animation: pulse 1.5s ease-in-out infinite;
  border: 1.5px solid #e8edf8;
}
.sk-tall  { height: 200px; }
.sk-short { height: 100px; }
@keyframes pulse { 0%,100%{opacity:.7} 50%{opacity:1} }

/* NOT FOUND */
.not-found {
  background: white; border-radius: 24px; padding: 80px 24px;
  text-align: center; border: 1.5px solid #e8edf8;
  box-shadow: 0 12px 40px rgba(37,99,235,.08);
}
.nf-icon  { font-size: 5rem; display: block; margin-bottom: 16px; }
.nf-title { font-size: 1.6rem; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
.nf-desc  { color: #94a3b8; margin-bottom: 24px; }
.btn-back-orders {
  display: inline-block; padding: 12px 28px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white;
  font-weight: 700; box-shadow: 0 6px 20px rgba(37,99,235,.3);
  transition: all .2s;
}
.btn-back-orders:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,.4); }

/* ══ LAYOUT ══ */
.detail-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: start;
}

/* ══ SHARED CARD ══ */
.info-card, .timeline-card, .products-card {
  background: white; border-radius: 22px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(37,99,235,.07);
  overflow: hidden;
}

.card-header {
  display: flex; align-items: center; gap: 10px;
  padding: 20px 24px 16px;
  border-bottom: 1.5px solid #f0f4ff;
}
.card-icon { font-size: 1.3rem; }
.card-title { font-weight: 900; font-size: 1rem; color: #0f172a; }

/* ══ INFO CARD ══ */
.info-card { margin-bottom: 16px; }
.info-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; padding: 4px 0;
}
.info-item {
  padding: 14px 24px;
  border-bottom: 1.5px solid #f8faff;
  display: flex; flex-direction: column; gap: 4px;
}
.info-item.full { grid-column: 1 / -1; }
.info-lbl {
  font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: #94a3b8;
}
.info-val {
  font-size: .9rem; font-weight: 600; color: #0f172a;
}
.info-val.mono { font-family: monospace; color: #2563eb; font-size: 1rem; }
.info-val.date { color: #64748b; }
.info-val.note {
  background: #fffbeb; border: 1.5px solid #fde68a;
  border-radius: 8px; padding: 8px 10px;
  color: #92400e; font-size: .82rem;
}

.payment-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 11px; border-radius: 999px;
  font-size: .75rem; font-weight: 700;
}
.pay-cod   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.pay-vnpay { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

/* ══ TIMELINE ══ */
.timeline {
  display: flex; align-items: flex-start;
  padding: 24px 24px 20px;
  gap: 0;
}
.timeline-step {
  display: flex; flex-direction: column; align-items: center;
  flex: 1; position: relative;
}
.step-dot {
  width: 40px; height: 40px; border-radius: 50%;
  background: #f0f4ff; border: 2px solid #e0e7ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; transition: all .3s; z-index: 1;
}
.timeline-step.active .step-dot {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border-color: #2563eb;
  box-shadow: 0 4px 14px rgba(37,99,235,.35);
}
.timeline-step.current .step-dot {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  box-shadow: 0 4px 14px rgba(16,185,129,.4);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100% { box-shadow: 0 4px 14px rgba(16,185,129,.4); }
  50%      { box-shadow: 0 4px 24px rgba(16,185,129,.7); }
}
.timeline-step.cancelled .step-dot { background: #f1f5f9; border-color: #e2e8f0; }

.step-line {
  position: absolute; top: 20px; left: 60%;
  width: calc(100% - 20px); height: 2px;
  background: #e0e7ff; z-index: 0;
}
.timeline-step.active .step-line {
  background: linear-gradient(90deg, #2563eb, #4f46e5);
}

.step-info { margin-top: 8px; text-align: center; }
.step-name {
  font-size: .68rem; font-weight: 700;
  color: #94a3b8; letter-spacing: .04em;
}
.timeline-step.active .step-name { color: #2563eb; }
.timeline-step.current .step-name { color: #10b981; }

.cancelled-notice {
  margin: 0 24px 20px;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 12px;
  background: #fee2e2; border: 1.5px solid #fecaca;
  color: #dc2626; font-weight: 700; font-size: .85rem;
}
.failed-notice {
  margin: 0 24px 20px;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 12px;
  background: #fef2f2; border: 1.5px solid #fecaca;
  color: #b91c1c; font-weight: 700; font-size: .85rem;
}

/* ══ PRODUCTS CARD ══ */
.product-list { display: flex; flex-direction: column; }

.product-row {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 24px;
  border-bottom: 1.5px solid #f8faff;
  transition: background .2s;
}
.product-row:last-child { border-bottom: none; }
.product-row:hover { background: #f8faff; }

.product-img-wrap { flex-shrink: 0; }
.product-img {
  width: 70px; height: 88px; object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0,0,0,.1);
  transition: transform .3s;
}
.product-row:hover .product-img { transform: scale(1.05); }

.product-info { flex: 1; }
.product-name { font-weight: 700; font-size: .92rem; color: #0f172a; line-height: 1.3; margin-bottom: 8px; }
.product-meta { display: flex; align-items: center; gap: 10px; }
.product-qty {
  display: inline-block; padding: 3px 10px; border-radius: 999px;
  background: #eff6ff; border: 1.5px solid #bfdbfe;
  color: #2563eb; font-size: .72rem; font-weight: 700;
}
.product-price-unit { font-size: .78rem; color: #94a3b8; }

.product-total { text-align: right; flex-shrink: 0; min-width: 100px; }
.total-lbl { display: block; font-size: .65rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
.total-val { font-weight: 900; font-size: 1rem; color: #e11d48; }

/* ══ SUMMARY ══ */
.order-summary {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff, #f5f3ff);
  border-top: 1.5px solid #e0e7ff;
  display: flex; flex-direction: column; gap: 12px;
}
.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .9rem; color: #475569;
}
.summary-divider { height: 1.5px; background: linear-gradient(90deg, #e0e7ff, #ddd6fe); border-radius: 999px; }
.summary-row.total { font-size: 1rem; font-weight: 800; color: #0f172a; }
.summary-price { color: #f97316; font-size: 1.3rem; font-weight: 900; }
.discount-row { color: #059669; }
.discount-val { font-weight: 700; color: #059669; }
.shipper-val { display: flex; align-items: center; gap: 8px; color: #7c3aed; }
.shipper-phone { font-size: .8rem; color: #94a3b8; font-weight: 500; }

/* ══ MOBILE ══ */
@media (max-width: 900px) {
  .detail-layout { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .hero { padding: 48px 16px 60px; }
  .hero-stats { gap: 14px; padding: 12px 18px; }
  .main-panel { padding: 0 12px 40px; }
  .info-grid { grid-template-columns: 1fr; }
  .timeline { gap: 0; }
  .step-name { font-size: .6rem; }
}
</style>