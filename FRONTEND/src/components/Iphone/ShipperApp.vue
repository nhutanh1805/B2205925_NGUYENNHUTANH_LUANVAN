<template>
  <div class="shipper-app">

    <!-- ══ AUTH SCREEN ══ -->
    <div v-if="!currentShipper" class="auth-screen">
      <div class="auth-bg">
        <div class="auth-orb orb1"></div>
        <div class="auth-orb orb2"></div>
      </div>

      <div class="auth-card">
        <div class="auth-logo">🛵</div>
        <h2 class="auth-title">Shipper App</h2>

        <!-- Tab switch -->
        <div class="auth-tabs">
          <button class="auth-tab" :class="{ active: authMode === 'login' }" @click="switchMode('login')">Đăng nhập</button>
          <button class="auth-tab" :class="{ active: authMode === 'register' }" @click="switchMode('register')">Đăng ký</button>
        </div>

        <!-- LOGIN -->
        <div v-if="authMode === 'login'" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input v-model="loginForm.email" type="email" placeholder="shipper@example.com" class="form-input" @keyup.enter="doLogin"/>
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input v-model="loginForm.password" type="password" placeholder="••••••••" class="form-input" @keyup.enter="doLogin"/>
          </div>
          <p v-if="authError" class="auth-error">{{ authError }}</p>
          <button class="btn-auth" :disabled="authLoading" @click="doLogin">
            <span v-if="authLoading" class="spinner"></span>
            <span v-else>Đăng nhập</span>
          </button>
          <p class="auth-switch">Chưa có tài khoản? <a @click="switchMode('register')">Đăng ký ngay</a></p>
        </div>

        <!-- REGISTER -->
        <div v-else class="auth-form">
          <div class="form-group">
            <label>Họ và tên</label>
            <input v-model="registerForm.name" type="text" placeholder="Nguyễn Văn A" class="form-input"/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Số điện thoại</label>
              <input v-model="registerForm.phone" type="tel" placeholder="09xxxxxxxx" class="form-input"/>
            </div>
            <div class="form-group">
              <label>Phương tiện</label>
              <input v-model="registerForm.vehicle" type="text" placeholder="Xe máy, Ô tô…" class="form-input"/>
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="registerForm.email" type="email" placeholder="shipper@example.com" class="form-input"/>
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input v-model="registerForm.password" type="password" placeholder="Tối thiểu 6 ký tự" class="form-input" @keyup.enter="doRegister"/>
          </div>
          <p v-if="authError" class="auth-error">{{ authError }}</p>
          <button class="btn-auth" :disabled="authLoading" @click="doRegister">
            <span v-if="authLoading" class="spinner"></span>
            <span v-else>Đăng ký &amp; Dùng ngay</span>
          </button>
          <p class="auth-switch">Đã có tài khoản? <a @click="switchMode('login')">Đăng nhập</a></p>
        </div>
      </div>
    </div>

    <!-- ══ MAIN APP ══ -->
    <template v-else>

      <!-- HEADER -->
      <div class="app-header">
        <div class="header-top">
          <div class="avatar"></div>
          <div class="header-info">
            <span class="header-greeting">{{ currentShipper.name }}</span>
            <span class="header-sub">{{ todayStr }}</span>
          </div>
          <button class="logout-btn" @click="logout" title="Đăng xuất">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-pill stat-confirm">
            <span class="sp-num">{{ stats.confirmed }}</span>
            <span class="sp-lbl">Chờ lấy</span>
          </div>
          <div class="stat-pill stat-ship">
            <span class="sp-num">{{ stats.shipping }}</span>
            <span class="sp-lbl">Đang giao</span>
          </div>
          <div class="stat-pill stat-done">
            <span class="sp-num">{{ stats.delivered }}</span>
            <span class="sp-lbl">Hoàn thành</span>
          </div>
        </div>
      </div>

      <!-- FILTER TABS -->
      <div class="filter-tabs">
        <button
          v-for="tab in tabs" :key="tab.value"
          class="tab-btn" :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span class="tab-badge" v-if="tabCount(tab.value) > 0">{{ tabCount(tab.value) }}</span>
        </button>
      </div>

      <!-- ORDER LIST -->
      <div class="order-list">

        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="skel-card">
            <div class="skel skel-top"></div>
            <div class="skel skel-mid"></div>
            <div class="skel skel-bot"></div>
          </div>
        </template>

        <div v-else-if="filteredOrders.length === 0" class="empty-box">
          <div class="empty-emoji">📭</div>
          <p class="empty-txt">Không có đơn nào</p>
        </div>

        <template v-else>
          <div
            v-for="(order, idx) in filteredOrders" :key="order._id"
            class="order-card" :class="`card-${order.status}`"
            :style="`animation-delay:${idx * 0.06}s`"
          >
            <div class="card-top">
              <div class="card-id">#{{ order._id.slice(-6).toUpperCase() }}</div>
              <span class="status-chip" :class="`chip-${order.status}`">{{ statusLabel(order.status) }}</span>
            </div>

            <div class="card-info">
              <div class="info-row">
                <span class="info-icon">📍</span>
                <span class="info-txt address-txt">{{ order.shippingAddress }}</span>
              </div>
              <div class="info-row">
                <span class="info-icon">📞</span>
                <a :href="`tel:${order.phone}`" class="info-txt phone-link">{{ order.phone }}</a>
              </div>
              <div class="info-row">
                <span class="info-icon">👤</span>
                <span class="info-txt">{{ order.userName }}</span>
              </div>
              <div class="info-row">
                <span class="info-icon">💰</span>
                <span class="info-txt price-txt">{{ formatPrice(order.totalPrice) }}₫</span>
              </div>
              <div v-if="order.note" class="info-row">
                <span class="info-icon">📝</span>
                <span class="info-txt note-txt">{{ order.note }}</span>
              </div>
            </div>

            <div class="items-row">
              <span v-for="(item, i) in order.items.slice(0, 2)" :key="i" class="item-chip">
                {{ item.name }} ×{{ item.quantity }}
              </span>
              <span v-if="order.items.length > 2" class="item-more">+{{ order.items.length - 2 }}</span>
            </div>

            <div class="card-action">
             <template v-if="order.status === 'confirmed' || order.status === 'paid'">
                <button class="action-btn btn-pickup" :disabled="updating === order._id" @click="changeStatus(order._id, 'shipping')">
                  <span v-if="updating === order._id" class="spinner"></span>
                  <span v-else>Bắt đầu giao</span>
                </button>
              </template>
              <template v-else-if="order.status === 'shipping'">
                <button class="action-btn btn-done" :disabled="updating === order._id" @click="changeStatus(order._id, 'delivered')">
                  <span v-if="updating === order._id" class="spinner"></span>
                  <span v-else>Giao thành công</span>
                </button>
              </template>
              <template v-else-if="order.status === 'delivered'">
                <div class="done-label">Đã hoàn thành</div>
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
        <button class="nav-btn" @click="logout">
          <span class="nav-icon">⎋</span>
          <span class="nav-lbl">Đăng xuất</span>
        </button>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import ShipperService from "@/services/shipper.service"

// ── Auth ───────────────────────────────────────────────
const currentShipper = ref(JSON.parse(localStorage.getItem("shipper") || "null"))
const authMode    = ref("login")
const authLoading = ref(false)
const authError   = ref("")

const loginForm = ref({ email: "", password: "" })
const registerForm = ref({ name: "", phone: "", email: "", password: "", vehicle: "" })

const switchMode = (mode) => {
  authMode.value = mode
  authError.value = ""
}

const doLogin = async () => {
  authError.value = ""
  if (!loginForm.value.email || !loginForm.value.password) {
    authError.value = "Vui lòng nhập email và mật khẩu"
    return
  }
  authLoading.value = true
  try {
    const res = await ShipperService.login(loginForm.value)
    currentShipper.value = res.data
    localStorage.setItem("shipper", JSON.stringify(res.data))
    await loadOrders()
    await loadStats()
  } catch (e) {
    authError.value = e.response?.data?.message || e.message || "Đăng nhập thất bại"
  } finally {
    authLoading.value = false
  }
}

const doRegister = async () => {
  authError.value = ""
  const { name, phone, email, password } = registerForm.value
  if (!name || !phone || !email || !password) {
    authError.value = "Vui lòng điền đầy đủ thông tin bắt buộc"
    return
  }
  if (password.length < 6) {
    authError.value = "Mật khẩu phải có ít nhất 6 ký tự"
    return
  }
  authLoading.value = true
  try {
    // Đăng ký xong → tự đăng nhập luôn
    await ShipperService.createShipper(registerForm.value)
    const res = await ShipperService.login({ email, password })
    currentShipper.value = res.data
    localStorage.setItem("shipper", JSON.stringify(res.data))
    await loadOrders()
    await loadStats()
  } catch (e) {
    authError.value = e.response?.data?.message || e.message || "Đăng ký thất bại"
  } finally {
    authLoading.value = false
  }
}

const logout = () => {
  currentShipper.value = null
  localStorage.removeItem("shipper")
  allOrders.value = []
  stats.value = { confirmed: 0, shipping: 0, delivered: 0 }
  loginForm.value = { email: "", password: "" }
  registerForm.value = { name: "", phone: "", email: "", password: "", vehicle: "" }
  authError.value = ""
  authMode.value = "login"
}

// ── App state ──────────────────────────────────────────
const allOrders = ref([])
const loading   = ref(false)
const updating  = ref(null)
const activeTab = ref("all")
const stats     = ref({ confirmed: 0, shipping: 0, delivered: 0 })

const tabs = [
  { label: "Tất cả",     value: "all"       },
  { label: "Chờ lấy",    value: "confirmed" },
  { label: "Đang giao",  value: "shipping"  },
  { label: "Hoàn thành", value: "delivered" },
]

const statusLabel = (s) => ({
  confirmed: "Chờ lấy",
  paid:      "Chờ lấy",
  shipping:  "Đang giao",
  delivered: "Hoàn thành",
}[s] || s)

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v)

const todayStr = computed(() =>
  new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })
)

const filteredOrders = computed(() =>
  activeTab.value === "all"
    ? allOrders.value
    : allOrders.value.filter(o => o.status === activeTab.value)
)

const tabCount = (val) => {
  if (val === "all") return 0
  return allOrders.value.filter(o => o.status === val).length
}

// ── API ────────────────────────────────────────────────
const loadOrders = async () => {
  if (!currentShipper.value) return
  loading.value = true
  try {
    const res = await ShipperService.getMyOrders(currentShipper.value._id)
    allOrders.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  if (!currentShipper.value) return
  try {
    const res = await ShipperService.getStats(currentShipper.value._id)
    stats.value = res.data
  } catch { /* ignore */ }
}

const changeStatus = async (orderId, newStatus) => {
  updating.value = orderId
  try {
    await ShipperService.updateOrderStatus(currentShipper.value._id, orderId, newStatus)
    const order = allOrders.value.find(o => o._id === orderId)
    if (order) order.status = newStatus
    await loadStats()
  } catch (e) {
    alert(e.response?.data?.message || e.message || "Cập nhật thất bại")
  } finally {
    updating.value = null
  }
}

onMounted(async () => {
  if (currentShipper.value) {
    await loadOrders()
    await loadStats()
  }
})
</script>

<style scoped>
.shipper-app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f8;
  font-family: 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
}

/* ══ AUTH ════════════════════════════════════════════ */
.auth-screen {
  flex: 1; min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 24px; position: relative;
  background: linear-gradient(145deg, #0f1225 0%, #1e2442 100%);
  overflow: hidden;
}
.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.auth-orb { position: absolute; border-radius: 50%; filter: blur(80px); }
.orb1 { width: 280px; height: 280px; background: rgba(99,102,241,.25); top: -60px; left: -60px; }
.orb2 { width: 220px; height: 220px; background: rgba(139,92,246,.2); bottom: -40px; right: -40px; }

.auth-card {
  position: relative; z-index: 2;
  background: rgba(255,255,255,.97);
  border-radius: 24px; padding: 36px 28px 28px;
  width: 100%; max-width: 400px;
  box-shadow: 0 32px 80px rgba(0,0,0,.35);
}
.auth-logo { font-size: 2.8rem; text-align: center; margin-bottom: 8px; }
.auth-title {
  font-size: 1.5rem; font-weight: 900; color: #0f172a;
  text-align: center; margin: 0 0 20px;
}

.auth-tabs {
  display: flex; background: #f1f5f9;
  border-radius: 12px; padding: 4px; margin-bottom: 20px; gap: 4px;
}
.auth-tab {
  flex: 1; padding: 8px; border-radius: 9px; border: none;
  font-size: .82rem; font-weight: 700; cursor: pointer;
  color: #64748b; background: transparent; transition: all .2s;
}
.auth-tab.active {
  background: white; color: #4f46e5;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: flex; gap: 10px; }
.form-row .form-group { flex: 1; min-width: 0; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: .73rem; font-weight: 700; color: #475569; letter-spacing: .02em; }
.form-input {
  padding: 10px 13px; border-radius: 10px;
  border: 1.5px solid #e0e7ff; font-size: .88rem; color: #0f172a;
  outline: none; transition: border-color .2s; background: #fafbff;
  width: 100%; box-sizing: border-box;
}
.form-input:focus { border-color: #6366f1; background: white; }

.auth-error {
  font-size: .75rem; color: #dc2626;
  background: #fee2e2; border-radius: 8px;
  padding: 8px 12px; margin: 0;
}

.btn-auth {
  width: 100%; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white; font-size: .9rem; font-weight: 800; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 8px 24px rgba(79,70,229,.3); transition: all .2s; margin-top: 4px;
}
.btn-auth:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(79,70,229,.4); }
.btn-auth:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.auth-switch {
  text-align: center; font-size: .75rem; color: #94a3b8; margin: 0;
}
.auth-switch a {
  color: #4f46e5; font-weight: 700; cursor: pointer; text-decoration: underline;
}

/* ══ HEADER ══════════════════════════════════════════ */
.app-header {
  background: linear-gradient(145deg, #1a1f3c 0%, #2d3561 100%);
  padding: 14px; flex-shrink: 0;
}
.header-top { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}
.header-info { flex: 1; display: flex; flex-direction: column; }
.header-greeting { font-size: .78rem; font-weight: 700; color: #fff; }
.header-sub { font-size: .62rem; color: rgba(255,255,255,.5); text-transform: capitalize; }
.logout-btn {
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
  color: rgba(255,255,255,.8); border-radius: 8px; padding: 6px 8px;
  cursor: pointer; display: flex; align-items: center; transition: all .2s;
}
.logout-btn:hover { background: rgba(255,255,255,.2); }

.stats-row { display: flex; gap: 8px; }
.stat-pill { flex: 1; border-radius: 10px; padding: 8px 6px; text-align: center; backdrop-filter: blur(8px); }
.stat-confirm { background: rgba(251,191,36,.18); border: 1px solid rgba(251,191,36,.3); }
.stat-ship    { background: rgba(139,92,246,.2);  border: 1px solid rgba(139,92,246,.3); }
.stat-done    { background: rgba(52,211,153,.18); border: 1px solid rgba(52,211,153,.3); }
.sp-num { display: block; font-size: 1.2rem; font-weight: 900; color: #fff; line-height: 1; }
.sp-lbl { font-size: .58rem; color: rgba(255,255,255,.6); letter-spacing: .04em; text-transform: uppercase; }

/* ══ FILTER TABS ══════════════════════════════════════ */
.filter-tabs {
  display: flex; gap: 6px; padding: 10px 12px 8px;
  background: #fff; border-bottom: 1px solid #e8edf8;
  flex-shrink: 0; overflow-x: auto; scrollbar-width: none;
}
.filter-tabs::-webkit-scrollbar { display: none; }
.tab-btn {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 13px; border-radius: 999px;
  border: 1.5px solid #e0e7ff; background: #f8faff;
  color: #64748b; font-size: .68rem; font-weight: 700; cursor: pointer; transition: all .2s;
}
.tab-btn.active {
  background: linear-gradient(135deg, #2d3561, #4f46e5);
  color: #fff; border-color: transparent;
  box-shadow: 0 3px 10px rgba(79,70,229,.3);
}
.tab-badge {
  background: #ef4444; color: #fff; border-radius: 999px;
  padding: 1px 5px; font-size: .55rem; font-weight: 900;
}

/* ══ ORDER LIST ══════════════════════════════════════ */
.order-list {
  flex: 1; overflow-y: auto; padding: 10px 10px 80px;
  display: flex; flex-direction: column; gap: 10px; scrollbar-width: none;
}
.order-list::-webkit-scrollbar { display: none; }

.skel-card {
  background: #fff; border-radius: 14px; padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skel { background: #e8edf8; border-radius: 6px; }
.skel-top { height: 10px; width: 60%; }
.skel-mid { height: 8px; width: 85%; }
.skel-bot { height: 8px; width: 40%; }
@keyframes shimmer { 0%,100%{ opacity:.5 } 50%{ opacity:1 } }

.empty-box { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; }
.empty-emoji { font-size: 3rem; margin-bottom: 10px; }
.empty-txt { font-size: .85rem; color: #94a3b8; font-weight: 600; }

/* ══ ORDER CARD ══════════════════════════════════════ */
.order-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid #e8edf8; border-left-width: 4px;
  padding: 14px; animation: cardIn .35s ease both;
  box-shadow: 0 2px 12px rgba(0,0,0,.05);
}
@keyframes cardIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.card-confirmed { border-left-color: #f59e0b; }
.card-paid      { border-left-color: #f59e0b; }
.card-shipping  { border-left-color: #8b5cf6; }
.card-delivered { border-left-color: #10b981; }

.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.card-id { font-size: .78rem; font-weight: 900; color: #1e293b; letter-spacing: .04em; }
.status-chip { font-size: .62rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.chip-confirmed { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.chip-paid      { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.chip-shipping  { background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.chip-delivered { background: #d1fae5; color: #059669; border: 1px solid #6ee7b7; }

.card-info { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.info-row { display: flex; align-items: flex-start; gap: 6px; }
.info-icon { font-size: .72rem; flex-shrink: 0; margin-top: 1px; }
.info-txt { font-size: .7rem; color: #475569; line-height: 1.3; }
.address-txt { font-weight: 600; color: #1e293b; }
.phone-link { font-weight: 700; color: #2563eb; text-decoration: none; }
.price-txt { font-weight: 800; color: #e11d48; font-size: .78rem; }
.note-txt { font-style: italic; color: #64748b; }

.items-row { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
.item-chip {
  font-size: .6rem; background: #f1f5f9; color: #475569;
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 2px 7px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;
}
.item-more {
  font-size: .6rem; background: #dbeafe; color: #2563eb;
  border: 1px solid #bfdbfe; border-radius: 6px; padding: 2px 7px; font-weight: 700;
}

.card-action { display: flex; }
.action-btn {
  flex: 1; padding: 10px; border-radius: 12px; border: none;
  font-size: .75rem; font-weight: 800; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 5px; transition: all .2s;
}
.btn-pickup {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff; box-shadow: 0 4px 12px rgba(245,158,11,.35);
}
.btn-pickup:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(245,158,11,.45); }
.btn-done {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,.35);
}
.btn-done:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,.45); }
.action-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.done-label {
  flex: 1; text-align: center; font-size: .7rem; font-weight: 700;
  color: #059669; background: #d1fae5; border-radius: 12px; padding: 9px; border: 1px solid #6ee7b7;
}

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ BOTTOM NAV ══════════════════════════════════════ */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; background: #fff; border-top: 1px solid #e8edf8;
  padding: 8px 0 14px; z-index: 100;
}
.nav-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: none; border: none; cursor: pointer; padding: 4px; transition: opacity .2s;
}
.nav-icon { font-size: 1.2rem; }
.nav-lbl { font-size: .58rem; font-weight: 700; color: #94a3b8; letter-spacing: .04em; }
.nav-btn.active .nav-lbl { color: #4f46e5; }
.nav-btn.active .nav-icon { filter: drop-shadow(0 2px 4px rgba(79,70,229,.4)); }
</style>