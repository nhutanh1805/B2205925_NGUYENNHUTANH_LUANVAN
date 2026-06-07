<template>
  <div class="orders-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Tài khoản của tôi
        </div>

        <h1 class="hero-title">
          Đơn hàng<br/>
          <em>của tôi</em>
        </h1>

        <p class="hero-sub">Theo dõi · Quản lý · Tra cứu trạng thái</p>

        <div class="hero-stats">
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
            <span class="stat-num">{{ deliveredCount }}</span>
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
        </div>
        <router-link to="/products" class="btn-shop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="shop-icon">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Mua sắm thêm
        </router-link>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="skeleton-list">
        <div v-for="i in 4" :key="i" class="skeleton-card">
          <div class="sk sk-id"></div>
          <div class="sk sk-mid"></div>
          <div class="sk sk-badge"></div>
          <div class="sk sk-btn"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!orders.length" class="empty-state">
        <div class="empty-icon">📭</div>
        <h2 class="empty-title">Chưa có đơn hàng nào</h2>
        <p class="empty-desc">Hãy khám phá sản phẩm và bắt đầu mua sắm ngay hôm nay</p>
        <router-link to="/products" class="btn-explore">Khám phá ngay →</router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div
          v-for="(order, idx) in orders"
          :key="order._id"
          class="ocard"
          :style="`--delay:${idx * 0.05}s`"
          @click="goToDetail(order._id)"
        >
          <div class="ocard-accent" :class="`accent-${order.status}`"></div>

          <div class="ocard-body">
            <div class="ocard-top">
              <span class="ocard-id">#{{ order._id.slice(-8).toUpperCase() }}</span>
              <span class="status-badge" :class="`badge-${order.status}`">
                <i class="dot"></i>{{ statusText(order.status) }}
              </span>
              <span class="payment-badge" :class="order.paymentMethod === 'VNPAY' ? 'pay-vnpay' : 'pay-cod'">
                {{ order.paymentMethod === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'THANH TOÁN COD' }}
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

          <div class="ocard-actions" @click.stop>
            <!-- Nút thanh toán lại cho đơn VNPAY còn pending -->
            <button
              v-if="order.paymentMethod === 'VNPAY' && order.status === 'pending'"
              @click="retryVNPay(order)"
              class="btn-vnpay"
              :disabled="retryingId === order._id"
            >
              {{ retryingId === order._id ? '...' : 'Thanh toán lại' }}
            </button>

            <button
              v-if="order.paymentMethod === 'COD' ? ['pending','confirmed','preparing'].includes(order.status) : order.status === 'pending'"
              @click="confirmCancel(order._id)"
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

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import OrderService from "@/services/order.service"

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const retryingId = ref(null) 

const pendingCount = computed(() =>
  orders.value.filter(o => ['pending', 'confirmed', 'paid', 'shipping'].includes(o.status)).length
)
const deliveredCount = computed(() =>
  orders.value.filter(o => o.status === 'completed').length
)

const statusText = (s) => ({
  pending:   "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  paid:      "Đã thanh toán",
  preparing: "Chuẩn bị hàng",
  shipping:  "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}[s] || s)

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v)
const formatDate = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

const loadOrders = async () => {
  loading.value = true
  try {
    orders.value = await OrderService.getOrders()
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => router.push(`/orders/${id}`)

const confirmCancel = (id) => {
  if (confirm("Bạn có chắc muốn hủy đơn hàng này không?")) cancelOrder(id)
}

const cancelOrder = async (id) => {
  try {
    await OrderService.updateOrderStatus(id, "cancelled")
    await loadOrders()
  } catch (err) {
    alert(err.message)
  }
}

// ✅ THÊM: Thanh toán lại đơn VNPAY
const retryVNPay = async (order) => {
  retryingId.value = order._id
  try {
    const res = await fetch("http://localhost:3000/api/payment/create-vnpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order._id,
        amount: order.totalPrice,
      }),
    })

    const data = await res.json()
    if (!data?.payment_url) throw new Error("Không lấy được link thanh toán")

    window.location.href = data.payment_url
  } catch (err) {
    alert(err.message)
  } finally {
    retryingId.value = null
  }
}

onMounted(loadOrders)
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative;
  overflow: hidden;
  background: #0a0f1e;
  padding: 72px 32px 80px;
  text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.15); top: 40%; left: 55%; }

.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px;
  padding: 6px 18px;
  font-size: .75rem;
  font-weight: 700;
  color: rgba(255,255,255,.8);
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 22px;
  backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}

.hero-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 900;
  color: white;
  line-height: 1.1;
  letter-spacing: -.01em;
  margin-bottom: 14px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: italic;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 1rem;
  color: rgba(255,255,255,.55);
  letter-spacing: .06em;
  margin-bottom: 36px;
}

.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: 24px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px;
  padding: 18px 32px;
  backdrop-filter: blur(16px);
}
.hero-stat { text-align: center; }
.stat-num {
  display: block;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: white;
  line-height: 1;
}
.stat-lbl { font-size: .7rem; color: rgba(255,255,255,.5); letter-spacing: .07em; text-transform: uppercase; margin-top: 3px; display: block; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.15); }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 900px;
  margin: -24px auto 0;
  padding: 0 24px 60px;
  position: relative;
  z-index: 10;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 20px;
  padding: 16px 24px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  margin-bottom: 20px;
  border: 1px solid rgba(37,99,235,.1);
}
.result-info { font-size: .9rem; color: #64748b; font-weight: 500; }
.result-num {
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.2rem;
  font-weight: 900;
  color: #2563eb;
}

.btn-shop {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  font-size: .85rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(37,99,235,.3);
  transition: all .2s;
}
.btn-shop:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.shop-icon { width: 15px; height: 15px; }

/* Skeleton */
.skeleton-list { display: flex; flex-direction: column; gap: 14px; }
.skeleton-card {
  background: white;
  border-radius: 18px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e8edf8;
  animation: pulse 1.6s ease-in-out infinite;
}
.sk { background: #e8edf8; border-radius: 8px; height: 14px; }
.sk-id { width: 110px; }
.sk-mid { flex: 1; }
.sk-badge { width: 80px; }
.sk-btn { width: 70px; height: 32px; border-radius: 10px; }
@keyframes pulse { 0%,100%{ opacity:.6 } 50%{ opacity:1 } }

/* Empty */
.empty-state {
  background: white;
  border-radius: 24px;
  padding: 80px 24px;
  text-align: center;
  border: 1px solid #e8edf8;
  box-shadow: 0 8px 40px rgba(10,15,30,.06);
}
.empty-icon { font-size: 4rem; display: block; margin-bottom: 20px; }
.empty-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px;
}
.empty-desc { color: #94a3b8; margin-bottom: 32px; }
.btn-explore {
  display: inline-block;
  padding: 13px 32px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  font-weight: 700;
  font-size: .95rem;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(37,99,235,.3);
  transition: all .2s;
}
.btn-explore:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(37,99,235,.4); }

/* ══ ORDER CARDS ══ */
.orders-list { display: flex; flex-direction: column; gap: 14px; }

.ocard {
  background: white;
  border-radius: 18px;
  border: 1.5px solid #e8edf8;
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  transition: transform .25s cubic-bezier(.175,.885,.32,1.275), box-shadow .25s, border-color .25s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ocard:hover {
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 16px 40px rgba(37,99,235,.13);
  border-color: #a5b4fc;
}

.ocard-accent {
  width: 5px;
  align-self: stretch;
  flex-shrink: 0;
}
.accent-pending   { background: linear-gradient(180deg, #fbbf24, #f59e0b); }
.accent-confirmed { background: linear-gradient(180deg, #60a5fa, #2563eb); }
.accent-paid      { background: linear-gradient(180deg, #34d399, #059669); }
.accent-shipping  { background: linear-gradient(180deg, #c084fc, #7c3aed); }
.accent-delivered { background: linear-gradient(180deg, #34d399, #10b981); }
.accent-cancelled { background: linear-gradient(180deg, #fca5a5, #ef4444); }
.accent-preparing { background: linear-gradient(180deg, #fb923c, #ea580c); }
.accent-completed { background: linear-gradient(180deg, #4ade80, #16a34a); }

.ocard-body { flex: 1; padding: 20px 22px; min-width: 0; }

.ocard-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.ocard-id {
  font-family: 'Times New Roman', Times, serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: #0f172a;
  letter-spacing: .03em;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .04em;
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

.payment-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .04em;
}
.pay-cod   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.pay-vnpay { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

.ocard-stats { display: flex; gap: 28px; flex-wrap: wrap; }
.ostat { display: flex; flex-direction: column; gap: 2px; }
.ostat-lbl {
  font-size: .68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #94a3b8;
}
.ostat-val { font-size: .9rem; font-weight: 600; color: #334155; }
.ostat-val.price {
  font-family: 'Times New Roman', Times, serif;
  font-size: 1rem;
  font-weight: 700;
  color: #e11d48;
}
.ostat-val.date { font-size: .8rem; color: #94a3b8; }

.ocard-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 20px 20px 0;
  flex-shrink: 0;
}

/* ✅ THÊM: Style nút thanh toán lại */
.btn-vnpay {
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #22c55e, #10b981);
  border: none;
  color: white;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(16,185,129,.3);
}
.btn-vnpay:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,.4); }
.btn-vnpay:disabled { opacity: .6; cursor: not-allowed; }

.btn-cancel {
  padding: 8px 16px;
  border-radius: 10px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
.btn-cancel:hover { background: #fecaca; border-color: #fca5a5; }

.btn-detail {
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff;
  color: #4f46e5;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.btn-detail:hover { background: linear-gradient(135deg, #dbeafe, #ede9fe); border-color: #c7d2fe; }
.arrow-icon { display: inline-block; transition: transform .2s; }
.btn-detail:hover .arrow-icon { transform: translateX(3px); }

/* Mobile */
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .hero-stats { gap: 16px; padding: 14px 20px; }
  .main-panel { padding: 0 14px 40px; }
  .ocard { flex-direction: column; align-items: stretch; }
  .ocard-accent { width: auto; height: 5px; }
  .ocard-actions { flex-direction: row; padding: 0 16px 16px; justify-content: flex-end; }
  .ocard-stats { gap: 16px; }
}
</style>