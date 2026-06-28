<template>
  <div class="shipper-app">

    <!-- ══ AUTH SCREEN ══ -->
    <div v-if="!currentShipper" class="auth-screen">
      <div class="auth-bg">
        <div class="auth-orb orb1"></div>
        <div class="auth-orb orb2"></div>
      </div>

      <div class="auth-scroll">
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
                <label>SĐT</label>
                <input v-model="registerForm.phone" type="tel" placeholder="09xxxxxxxx" class="form-input"/>
              </div>
              <div class="form-group">
                <label>Phương tiện</label>
                <input v-model="registerForm.vehicle" type="text" placeholder="Xe máy…" class="form-input"/>
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
    </div>

    <!-- ══ MAIN APP ══ -->
    <template v-else>

      <!-- HEADER -->
      <div class="app-header">
        <div class="header-mesh"></div>
        <div class="header-top">
          <div class="avatar">🛵</div>
          <div class="header-info">
            <span class="header-greeting">{{ currentShipper.name }}</span>
            <span class="header-sub">{{ todayStr }}</span>
          </div>
          <button class="logout-btn" @click="logout" title="Đăng xuất">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-pill stat-confirm">
            <span class="sp-num">{{ stats.preparing }}</span>
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
          <div class="empty-emoji"></div>
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
              <div v-if="order.failReason" class="info-row">
                <span class="info-icon"></span>
                <span class="info-txt fail-reason-txt">{{ order.failReason }}</span>
              </div>
            </div>

            <div class="items-row">
              <span v-for="(item, i) in order.items.slice(0, 2)" :key="i" class="item-chip">
                {{ item.name }} ×{{ item.quantity }}
              </span>
              <span v-if="order.items.length > 2" class="item-more">+{{ order.items.length - 2 }}</span>
            </div>

            <div class="card-action">
             <template v-if="order.status === 'preparing'">
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
                <button class="action-btn btn-fail" :disabled="updating === order._id" @click="openFailModal(order)">
                  Thất bại
                </button>
              </template>
              <template v-else-if="order.status === 'failed'">
                <div class="fail-label">Đã báo thất bại — chờ admin xử lý</div>
              </template>
              <template v-else-if="order.status === 'delivered'">
                <div class="done-label">Chờ admin xác nhận</div>
              </template>
              <template v-else-if="order.status === 'completed'">
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

      <!-- ══ MODAL LÝ DO THẤT BẠI ══ -->
      <div v-if="showFailModal" class="fail-modal-overlay" @click.self="closeFailModal">
        <div class="fail-modal-box">
          <h3 class="fail-modal-title">Lý do giao thất bại</h3>
          <p class="fail-modal-sub" v-if="failTargetOrder">
            Đơn #{{ failTargetOrder._id.slice(-6).toUpperCase() }}
          </p>

          <div class="fail-reason-list">
            <button
              v-for="r in failReasons" :key="r"
              class="fail-reason-btn" :class="{ active: failReason === r }"
              @click="failReason = r"
            >{{ r }}</button>
          </div>

          <div class="fail-modal-actions">
            <button class="btn-fail-cancel" @click="closeFailModal">Hủy</button>
            <button class="btn-fail-confirm" :disabled="!failReason || updating" @click="confirmFail">
              <span v-if="updating" class="spinner"></span>
              <span v-else>Xác nhận</span>
            </button>
          </div>
        </div>
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
  stats.value = { preparing: 0, shipping: 0, delivered: 0 }
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
const stats     = ref({ preparing: 0, shipping: 0, delivered: 0 })

const tabs = [
  { label: "Tất cả",     value: "all"       },
  { label: "Chờ lấy",    value: "preparing" },
  { label: "Đang giao",  value: "shipping"  },
  { label: "Thất bại",   value: "failed"    },
  { label: "Đã giao",    value: "delivered" },
  { label: "Hoàn thành", value: "completed" },
]

const statusLabel = (s) => ({
  confirmed: "Chờ lấy",
  paid:      "Chờ lấy",
  preparing: "Chờ lấy",
  shipping:  "Đang giao",
  failed:    "Thất bại",
  delivered: "Đã giao",
  completed: "Hoàn thành",
}[s] || s)

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v)

const todayStr = computed(() =>
  new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })
)

const filteredOrders = computed(() => {
  if (activeTab.value === "all") return allOrders.value
  if (activeTab.value === "preparing")
    return allOrders.value.filter(o => ["confirmed", "paid", "preparing"].includes(o.status))
  return allOrders.value.filter(o => o.status === activeTab.value)
})

const tabCount = (val) => {
  if (val === "all") return 0
  if (val === "preparing")
    return allOrders.value.filter(o => ["confirmed", "paid", "preparing"].includes(o.status)).length
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

// ── Báo giao thất bại ──────────────────────────────────
const showFailModal   = ref(false)
const failTargetOrder = ref(null)
const failReason      = ref("")
const failReasons = [
  "Khách không nhận hàng",
  "Không liên lạc được khách",
  "Sai địa chỉ giao hàng",
  "Khách hủy khi nhận hàng",
  "Khác",
]

const openFailModal = (order) => {
  failTargetOrder.value = order
  failReason.value = ""
  showFailModal.value = true
}
const closeFailModal = () => {
  showFailModal.value = false
  failTargetOrder.value = null
  failReason.value = ""
}
const confirmFail = async () => {
  if (!failReason.value || !failTargetOrder.value) return
  const orderId = failTargetOrder.value._id
  updating.value = orderId
  try {
    await ShipperService.updateOrderStatus(currentShipper.value._id, orderId, "failed", failReason.value)
    const order = allOrders.value.find(o => o._id === orderId)
    if (order) { order.status = "failed"; order.failReason = failReason.value }
    await loadStats()
    closeFailModal()
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
/*
  Component này được thiết kế để nhúng vào BÊN TRONG khung iPhone
  (.iphone-wrapper: 240x520px, border-radius 45px, overflow hidden).
  => .shipper-app PHẢI lấp đầy khung cha bằng absolute/inset, tuyệt đối
     không dùng min-height:100vh hay position:fixed ở đây.
*/
.shipper-app {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f0f2f8;
  font-family: 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  overflow: hidden;
  border-radius: inherit;
  font-size: 10px; /* base scale cho toàn bộ rem bên trong */
}

/* ══ AUTH ════════════════════════════════════════════ */
.auth-screen {
  flex: 1; position: relative;
  background: linear-gradient(145deg, #0f1225 0%, #1e2442 100%);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.auth-orb { position: absolute; border-radius: 50%; filter: blur(40px); }
.orb1 { width: 140px; height: 140px; background: rgba(99,102,241,.3); top: -30px; left: -30px; }
.orb2 { width: 110px; height: 110px; background: rgba(139,92,246,.25); bottom: -20px; right: -20px; }

.auth-scroll {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  display: flex; align-items: center; justify-content: center;
  padding: 16px 12px; position: relative; z-index: 2;
  scrollbar-width: none;
}
.auth-scroll::-webkit-scrollbar { display: none; }

.auth-card {
  background: rgba(255,255,255,.97);
  border-radius: 16px; padding: 18px 14px 14px;
  width: 100%;
  box-shadow: 0 14px 30px rgba(0,0,0,.35);
}
.auth-logo { font-size: 1.7rem; text-align: center; margin-bottom: 4px; }
.auth-title {
  font-size: 1rem; font-weight: 900; color: #0f172a;
  text-align: center; margin: 0 0 12px;
}

.auth-tabs {
  display: flex; background: #f1f5f9;
  border-radius: 9px; padding: 3px; margin-bottom: 12px; gap: 3px;
}
.auth-tab {
  flex: 1; padding: 6px; border-radius: 7px; border: none;
  font-size: .68rem; font-weight: 700; cursor: pointer;
  color: #64748b; background: transparent; transition: all .2s;
}
.auth-tab.active {
  background: white; color: #4f46e5;
  box-shadow: 0 2px 5px rgba(0,0,0,.1);
}

.auth-form { display: flex; flex-direction: column; gap: 9px; }
.form-row { display: flex; gap: 7px; }
.form-row .form-group { flex: 1; min-width: 0; }
.form-group { display: flex; flex-direction: column; gap: 3px; }
.form-group label { font-size: .62rem; font-weight: 700; color: #475569; }
.form-input {
  padding: 7px 9px; border-radius: 8px;
  border: 1.3px solid #e0e7ff; font-size: .7rem; color: #0f172a;
  outline: none; transition: border-color .2s; background: #fafbff;
  width: 100%; box-sizing: border-box;
}
.form-input:focus { border-color: #6366f1; background: white; }

.auth-error {
  font-size: .62rem; color: #dc2626;
  background: #fee2e2; border-radius: 7px;
  padding: 6px 9px; margin: 0;
}

.btn-auth {
  width: 100%; padding: 9px; border-radius: 9px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white; font-size: .72rem; font-weight: 800; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 5px 14px rgba(79,70,229,.3); transition: all .2s; margin-top: 2px;
}
.btn-auth:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 18px rgba(79,70,229,.4); }
.btn-auth:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.auth-switch {
  text-align: center; font-size: .62rem; color: #94a3b8; margin: 0;
}
.auth-switch a {
  color: #4f46e5; font-weight: 700; cursor: pointer; text-decoration: underline;
}

/* ══ HEADER ══════════════════════════════════════════ */
.app-header {
  position: relative; overflow: hidden;
  background: linear-gradient(145deg, #1a1f3c 0%, #2d3561 100%);
  padding: 8px 10px 9px; flex-shrink: 0;
}
.header-mesh {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 60% at 15% 0%, rgba(124,58,237,.35), transparent);
  pointer-events: none;
}
.header-top { position: relative; display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
.avatar {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(255,255,255,.14);
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; flex-shrink: 0;
}
.header-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.header-greeting { font-size: .68rem; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.header-sub { font-size: .54rem; color: rgba(255,255,255,.5); text-transform: capitalize; }
.logout-btn {
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
  color: rgba(255,255,255,.8); border-radius: 6px; padding: 4px 5px;
  cursor: pointer; display: flex; align-items: center; transition: all .2s; flex-shrink: 0;
}
.logout-btn:hover { background: rgba(255,255,255,.2); }

.stats-row { position: relative; display: flex; gap: 5px; }
.stat-pill { flex: 1; border-radius: 8px; padding: 5px 3px; text-align: center; }
.stat-confirm { background: rgba(251,191,36,.18); border: 1px solid rgba(251,191,36,.3); }
.stat-ship    { background: rgba(139,92,246,.2);  border: 1px solid rgba(139,92,246,.3); }
.stat-done    { background: rgba(52,211,153,.18); border: 1px solid rgba(52,211,153,.3); }
.sp-num { display: block; font-size: .82rem; font-weight: 900; color: #fff; line-height: 1; }
.sp-lbl { font-size: .5rem; color: rgba(255,255,255,.6); letter-spacing: .02em; text-transform: uppercase; }

/* ══ FILTER TABS ══════════════════════════════════════ */
.filter-tabs {
  display: flex; gap: 4px; padding: 7px 8px 6px;
  background: #fff; border-bottom: 1px solid #e8edf8;
  flex-shrink: 0; overflow-x: auto; scrollbar-width: none;
}
.filter-tabs::-webkit-scrollbar { display: none; }
.tab-btn {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 3px;
  padding: 4px 9px; border-radius: 999px;
  border: 1.3px solid #e0e7ff; background: #f8faff;
  color: #64748b; font-size: .6rem; font-weight: 700; cursor: pointer; transition: all .2s;
}
.tab-btn.active {
  background: linear-gradient(135deg, #2d3561, #4f46e5);
  color: #fff; border-color: transparent;
  box-shadow: 0 2px 7px rgba(79,70,229,.3);
}
.tab-badge {
  background: #ef4444; color: #fff; border-radius: 999px;
  padding: 1px 4px; font-size: .48rem; font-weight: 900;
}

/* ══ ORDER LIST ══════════════════════════════════════ */
.order-list {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding: 8px 8px 64px;
  display: flex; flex-direction: column; gap: 7px; scrollbar-width: none;
}
.order-list::-webkit-scrollbar { display: none; }

.skel-card {
  background: #fff; border-radius: 11px; padding: 10px;
  display: flex; flex-direction: column; gap: 6px;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skel { background: #e8edf8; border-radius: 5px; }
.skel-top { height: 7px; width: 60%; }
.skel-mid { height: 6px; width: 85%; }
.skel-bot { height: 6px; width: 40%; }
@keyframes shimmer { 0%,100%{ opacity:.5 } 50%{ opacity:1 } }

.empty-box { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px 0; }
.empty-emoji { font-size: 1.8rem; margin-bottom: 6px; }
.empty-txt { font-size: .68rem; color: #94a3b8; font-weight: 600; }

/* ══ ORDER CARD ══════════════════════════════════════ */
.order-card {
  background: #fff; border-radius: 12px;
  border: 1.3px solid #e8edf8; border-left-width: 3px;
  padding: 9px; animation: cardIn .35s ease both;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
@keyframes cardIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
.card-confirmed { border-left-color: #f59e0b; }
.card-paid      { border-left-color: #f59e0b; }
.card-preparing { border-left-color: #f59e0b; }
.card-shipping  { border-left-color: #8b5cf6; }
.card-delivered { border-left-color: #10b981; }
.card-completed { border-left-color: #16a34a; }
.card-failed    { border-left-color: #dc2626; }

.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
.card-id { font-size: .62rem; font-weight: 900; color: #1e293b; letter-spacing: .02em; }
.status-chip { font-size: .52rem; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
.chip-confirmed { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.chip-paid      { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.chip-shipping  { background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.chip-delivered { background: #d1fae5; color: #059669; border: 1px solid #6ee7b7; }
.chip-preparing { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.chip-completed { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.chip-failed    { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

.card-info { display: flex; flex-direction: column; gap: 4px; margin-bottom: 7px; }
.info-row { display: flex; align-items: flex-start; gap: 5px; }
.info-icon { font-size: .6rem; flex-shrink: 0; margin-top: 1px; }
.info-txt { font-size: .58rem; color: #475569; line-height: 1.3; word-break: break-word; }
.address-txt { font-weight: 600; color: #1e293b; }
.phone-link { font-weight: 700; color: #2563eb; text-decoration: none; }
.price-txt { font-weight: 800; color: #e11d48; font-size: .64rem; }
.note-txt { font-style: italic; color: #64748b; }
.fail-reason-txt { font-weight: 700; color: #b91c1c; }

.items-row { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 7px; }
.item-chip {
  font-size: .5rem; background: #f1f5f9; color: #475569;
  border: 1px solid #e2e8f0; border-radius: 5px;
  padding: 2px 6px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px;
}
.item-more {
  font-size: .5rem; background: #dbeafe; color: #2563eb;
  border: 1px solid #bfdbfe; border-radius: 5px; padding: 2px 6px; font-weight: 700;
}

.card-action { display: flex; gap: 6px; }
.action-btn {
  flex: 1; padding: 7px; border-radius: 9px; border: none;
  font-size: .62rem; font-weight: 800; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 4px; transition: all .2s;
}
.btn-pickup {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff; box-shadow: 0 3px 8px rgba(245,158,11,.35);
}
.btn-pickup:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(245,158,11,.45); }
.btn-done {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; box-shadow: 0 3px 8px rgba(16,185,129,.35);
}
.btn-done:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,.45); }
.btn-fail {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff; box-shadow: 0 3px 8px rgba(239,68,68,.35);
  flex: 0 0 auto; padding: 7px 12px;
}
.btn-fail:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239,68,68,.45); }
.action-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.done-label, .fail-label {
  flex: 1; text-align: center; font-size: .58rem; font-weight: 700;
  border-radius: 9px; padding: 6px;
}
.done-label { color: #059669; background: #d1fae5; border: 1px solid #6ee7b7; }
.fail-label { color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; }

.spinner {
  width: 10px; height: 10px;
  border: 1.6px solid rgba(255,255,255,.4); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ BOTTOM NAV ══════════════════════════════════════ */
.bottom-nav {
  position: absolute; bottom: 0; left: 0; right: 0;
  display: flex; background: #fff; border-top: 1px solid #e8edf8;
  padding: 5px 0 14px; z-index: 50;
}
.nav-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px;
  background: none; border: none; cursor: pointer; padding: 3px; transition: opacity .2s;
}
.nav-icon { font-size: .85rem; }
.nav-lbl { font-size: .48rem; font-weight: 700; color: #94a3b8; letter-spacing: .02em; }
.nav-btn.active .nav-lbl { color: #4f46e5; }
.nav-btn.active .nav-icon { filter: drop-shadow(0 1px 3px rgba(79,70,229,.4)); }

/* ══ FAIL REASON MODAL ══════════════════════════════ */
.fail-modal-overlay {
  position: absolute; inset: 0; z-index: 100;
  background: rgba(15,18,37,.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.fail-modal-box {
  background: #fff; border-radius: 14px; width: 100%;
  padding: 14px; box-shadow: 0 14px 30px rgba(0,0,0,.35);
}
.fail-modal-title { font-size: .82rem; font-weight: 900; color: #0f172a; margin: 0 0 3px; }
.fail-modal-sub { font-size: .62rem; color: #94a3b8; margin: 0 0 10px; }
.fail-reason-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.fail-reason-btn {
  text-align: left; padding: 8px 10px; border-radius: 9px;
  border: 1.3px solid #e0e7ff; background: #f8faff;
  font-size: .66rem; font-weight: 600; color: #334155; cursor: pointer; transition: all .15s;
}
.fail-reason-btn.active {
  border-color: #ef4444; background: #fef2f2; color: #b91c1c; font-weight: 800;
}
.fail-modal-actions { display: flex; gap: 8px; }
.btn-fail-cancel {
  flex: 1; padding: 8px; border-radius: 9px; font-size: .66rem; font-weight: 700;
  background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; cursor: pointer;
}
.btn-fail-confirm {
  flex: 1; padding: 8px; border-radius: 9px; font-size: .66rem; font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  box-shadow: 0 3px 8px rgba(239,68,68,.3);
}
.btn-fail-confirm:disabled { opacity: .6; cursor: not-allowed; }
</style>