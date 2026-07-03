<template>
  <div class="admin-shipper-page">

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
          <em>shipper</em>
        </h1>

        <p class="hero-sub">Xem · Tìm kiếm · Quản lý trạng thái</p>

        <div class="hero-stats" v-if="!loading">
          <div class="hero-stat">
            <span class="stat-num">{{ shippers.length }}</span>
            <span class="stat-lbl">Tổng shipper</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ activeCount }}</span>
            <span class="stat-lbl">Đang hoạt động</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ inactiveCount }}</span>
            <span class="stat-lbl">Vô hiệu hóa</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <!-- Top bar -->
      <div class="top-bar">
        <div class="result-info">
          <span class="result-num">{{ filtered.length }}</span> shipper
        </div>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon-svg">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="search"
            class="search-input"
            placeholder="Tìm tên, SĐT hoặc email..."
          />
        </div>
      </div>

      <!-- SKELETON -->
      <div v-if="loading" class="skeleton-list">
        <div v-for="i in 5" :key="i" class="skeleton-card">
          <div class="sk sk-avatar"></div>
          <div class="sk sk-mid"></div>
          <div class="sk sk-badge"></div>
          <div class="sk sk-btn"></div>
        </div>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="empty-state">
        <div class="empty-icon"></div>
        <h2 class="empty-title">Có lỗi xảy ra</h2>
        <p class="empty-desc">{{ error }}</p>
        <button class="btn-explore" @click="loadShippers">Thử lại →</button>
      </div>

      <!-- EMPTY -->
      <div v-else-if="!shippers.length" class="empty-state">
        <div class="empty-icon"></div>
        <h2 class="empty-title">Chưa có shipper nào</h2>
        <p class="empty-desc">Khi có shipper đăng ký, họ sẽ xuất hiện tại đây</p>
      </div>

      <!-- SHIPPER CARDS -->
      <div v-else class="shippers-list">
        <div
          v-for="(sp, idx) in filtered"
          :key="sp._id"
          class="scard"
          :class="{ 'scard--inactive': sp.status === 'inactive' }"
          :style="`--delay:${idx * 0.04}s`"
        >
          <!-- Accent bar -->
          <div class="scard-accent" :class="sp.status === 'inactive' ? 'accent-inactive' : 'accent-active'"></div>

          <!-- Avatar -->
          <div class="scard-avatar" :style="avatarStyle(sp.name)">
            {{ initials(sp.name) }}
          </div>

          <!-- Body -->
          <div class="scard-body">
            <div class="scard-top">
              <span class="scard-name">{{ sp.name }}</span>
              <span class="scard-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {{ sp.phone }}
              </span>
              <span class="scard-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {{ sp.email }}
              </span>
              <span v-if="sp.vehicle" class="vehicle-badge">{{ sp.vehicle }}</span>
              <span class="status-badge" :class="sp.status === 'inactive' ? 'badge-inactive' : 'badge-active'">
                <i class="dot"></i>{{ sp.status === "inactive" ? "Vô hiệu hóa" : "Hoạt động" }}
              </span>
            </div>

            <div class="scard-stats">
              <div class="sstat">
                <span class="sstat-lbl">ID</span>
                <span class="sstat-val">#{{ sp._id?.slice(-8).toUpperCase() }}</span>
              </div>
              <div class="sstat">
                <span class="sstat-lbl">Ngày tạo</span>
                <span class="sstat-val date">{{ formatDate(sp.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="scard-actions">
            <button @click="openStats(sp)" class="btn-stats">
              Thống kê
            </button>

            <button
              v-if="sp.status === 'inactive'"
              @click="confirmActivate(sp)"
              class="btn-activate"
            >
              Kích hoạt <span>↩</span>
            </button>
            <button
              v-else
              @click="confirmDeactivate(sp)"
              class="btn-deactivate"
            >
              Vô hiệu hóa
            </button>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="no-result">
          Không tìm thấy kết quả cho "<strong>{{ search }}</strong>"
        </div>
      </div>

    </div>

    <!-- ══ MODALS ══ -->

    <Teleport to="body">
      <div v-if="deactivateTarget" class="g-modal-overlay" @click.self="deactivateTarget = null">
        <div class="g-modal">
          <div class="g-modal-icon"></div>
          <h3 class="g-modal-title">Vô hiệu hóa shipper</h3>
          <p class="g-modal-body">
            Bạn có chắc muốn vô hiệu hóa shipper
            <strong>{{ deactivateTarget.name }}</strong>?<br/>
            Shipper sẽ không thể đăng nhập hoặc nhận đơn cho đến khi được kích hoạt lại.
          </p>
          <div class="g-modal-actions">
            <button class="g-btn-cancel" @click="deactivateTarget = null">Hủy</button>
            <button class="g-btn-confirm g-btn-orange" :disabled="actionLoading" @click="handleDeactivate">
              {{ actionLoading ? "Đang xử lý..." : "Vô hiệu hóa" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="activateTarget" class="g-modal-overlay" @click.self="activateTarget = null">
        <div class="g-modal">
          <div class="g-modal-icon"></div>
          <h3 class="g-modal-title">Kích hoạt lại shipper</h3>
          <p class="g-modal-body">
            Bạn có chắc muốn kích hoạt lại shipper
            <strong>{{ activateTarget.name }}</strong>?<br/>
            Shipper sẽ có thể đăng nhập và nhận đơn bình thường.
          </p>
          <div class="g-modal-actions">
            <button class="g-btn-cancel" @click="activateTarget = null">Hủy</button>
            <button class="g-btn-confirm g-btn-green" :disabled="actionLoading" @click="handleActivate">
              {{ actionLoading ? "Đang xử lý..." : "Kích hoạt" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="statsTarget" class="g-modal-overlay" @click.self="closeStats">
        <div class="g-modal g-modal-stats">
          <div class="g-modal-icon"></div>
          <h3 class="g-modal-title">Thống kê giao hàng</h3>
          <p class="g-modal-sub">{{ statsTarget.name }}</p>

          <div v-if="statsLoading" class="stats-loading">Đang tải...</div>
          <div v-else-if="statsError" class="stats-error">{{ statsError }}</div>
          <template v-else>
            <div class="stats-grid">
              <div class="stat-box stat-assigned">
                <span class="stat-box-num">{{ statsData.assigned ?? 0 }}</span>
                <span class="stat-box-lbl">Đã nhận đơn</span>
              </div>
              <div class="stat-box stat-shipping">
                <span class="stat-box-num">{{ statsData.shipping ?? 0 }}</span>
                <span class="stat-box-lbl">Đang giao</span>
              </div>
              <div class="stat-box stat-delivered">
                <span class="stat-box-num">{{ statsData.delivered ?? 0 }}</span>
                <span class="stat-box-lbl">Đã giao</span>
              </div>
              <div class="stat-box stat-failed">
                <span class="stat-box-num">{{ statsData.failed ?? 0 }}</span>
                <span class="stat-box-lbl">Giao thất bại</span>
              </div>
            </div>
            <p class="stats-total">Tổng cộng: <strong>{{ statsData.total ?? 0 }}</strong> lượt giao</p>
          </template>

          <div class="g-modal-actions">
            <button class="g-btn-cancel" @click="closeStats">Đóng</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import adminShipperService from "@/services/adminShipper.service"

const shippers = ref([])
const loading  = ref(true)
const error    = ref(null)
const search   = ref("")

const deactivateTarget = ref(null)
const activateTarget   = ref(null)
const actionLoading    = ref(false)

const statsTarget  = ref(null)
const statsData    = ref({})
const statsLoading = ref(false)
const statsError   = ref(null)

const activeCount   = computed(() => shippers.value.filter(s => s.status !== "inactive").length)
const inactiveCount = computed(() => shippers.value.filter(s => s.status === "inactive").length)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return shippers.value
  return shippers.value.filter(
    s =>
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q)
  )
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—"
const initials   = (name = "") => name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase()
const avatarStyle = (name = "") => {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return { background: `hsl(${hue},55%,88%)`, color: `hsl(${hue},55%,32%)` }
}

const loadShippers = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await adminShipperService.getAll()
    shippers.value = res.data || res
  } catch (err) {
    error.value = err.message || "Không thể tải danh sách shipper"
  } finally {
    loading.value = false
  }
}

// ── Deactivate ──
const confirmDeactivate = (sp) => { deactivateTarget.value = sp }
const handleDeactivate = async () => {
  actionLoading.value = true
  try {
    const updated = await adminShipperService.updateStatus(deactivateTarget.value._id, "inactive")
    const idx = shippers.value.findIndex(s => s._id === deactivateTarget.value._id)
    if (idx !== -1) shippers.value.splice(idx, 1, updated.data || updated)
    deactivateTarget.value = null
  } catch (err) {
    alert("Vô hiệu hóa thất bại: " + err.message)
  } finally {
    actionLoading.value = false
  }
}

// ── Activate ──
const confirmActivate = (sp) => { activateTarget.value = sp }
const handleActivate = async () => {
  actionLoading.value = true
  try {
    const updated = await adminShipperService.updateStatus(activateTarget.value._id, "active")
    const idx = shippers.value.findIndex(s => s._id === activateTarget.value._id)
    if (idx !== -1) shippers.value.splice(idx, 1, updated.data || updated)
    activateTarget.value = null
  } catch (err) {
    alert("Kích hoạt thất bại: " + err.message)
  } finally {
    actionLoading.value = false
  }
}

// ── Stats modal ──
const openStats = async (sp) => {
  statsTarget.value = sp
  statsData.value = {}
  statsError.value = null
  statsLoading.value = true
  try {
    const res = await adminShipperService.getStats(sp._id)
    statsData.value = res.data || res
  } catch (err) {
    statsError.value = err.message || "Không thể tải thống kê"
  } finally {
    statsLoading.value = false
  }
}
const closeStats = () => {
  statsTarget.value = null
  statsData.value = {}
  statsError.value = null
}

onMounted(() => loadShippers())
</script>

<style scoped>
.admin-shipper-page {
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
  background: #34d399; box-shadow: 0 0 8px #34d399;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
.hero-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.01em;
  margin-bottom: 14px; text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: italic;
  background: linear-gradient(90deg, #34d399, #60a5fa, #a78bfa);
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

/* TOP BAR */
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: white; border-radius: 20px; padding: 16px 24px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  margin-bottom: 20px; border: 1px solid rgba(37,99,235,.1);
  gap: 16px; flex-wrap: wrap;
}
.result-info { font-size: .9rem; color: #64748b; font-weight: 500; }
.result-num { font-family: 'Times New Roman', Times, serif; font-size: 1.2rem; font-weight: 900; color: #2563eb; }
.search-wrap { position: relative; }
.search-icon-svg {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px; color: #94a3b8; pointer-events: none;
}
.search-input {
  padding: 10px 14px 10px 36px; border: 1.5px solid #e0e7ff; border-radius: 12px;
  background: #f8faff; font-size: .85rem; color: #334155;
  width: 260px; outline: none; transition: border-color .2s, background .2s;
}
.search-input:focus { border-color: #a5b4fc; background: #eff6ff; }

/* SKELETON */
.skeleton-list { display: flex; flex-direction: column; gap: 14px; }
.skeleton-card {
  background: white; border-radius: 18px; padding: 24px 28px;
  display: flex; align-items: center; gap: 16px;
  border: 1px solid #e8edf8; animation: pulse 1.6s ease-in-out infinite;
}
.sk { background: #e8edf8; border-radius: 8px; height: 14px; }
.sk-avatar { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
.sk-mid { flex: 1; }
.sk-badge { width: 90px; }
.sk-btn { width: 70px; height: 32px; border-radius: 10px; }
@keyframes pulse { 0%,100%{ opacity:.6 } 50%{ opacity:1 } }

/* EMPTY / ERROR */
.empty-state {
  background: white; border-radius: 24px; padding: 80px 24px;
  text-align: center; border: 1px solid #e8edf8;
  box-shadow: 0 8px 40px rgba(10,15,30,.06);
}
.empty-icon { font-size: 4rem; display: block; margin-bottom: 20px; }
.empty-title { font-family: 'Times New Roman', Times, serif; font-size: 1.8rem; font-weight: 700; color: #0f172a; margin: 0 0 10px; }
.empty-desc { color: #94a3b8; margin-bottom: 32px; }
.btn-explore {
  display: inline-block; padding: 13px 32px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-weight: 700; font-size: .95rem; border: none; cursor: pointer;
  box-shadow: 0 8px 24px rgba(37,99,235,.3); transition: all .2s;
}
.btn-explore:hover { transform: translateY(-2px); }

/* ══ SHIPPER CARDS ══ */
.shippers-list { display: flex; flex-direction: column; gap: 14px; }
.scard {
  background: white; border-radius: 18px; border: 1.5px solid #e8edf8;
  display: flex; align-items: center; overflow: hidden;
  transition: transform .25s cubic-bezier(.175,.885,.32,1.275), box-shadow .25s, border-color .25s;
  animation: cardIn .4s ease both; animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.scard:hover { transform: translateY(-4px) scale(1.005); box-shadow: 0 16px 40px rgba(37,99,235,.13); border-color: #a5b4fc; }
.scard--inactive { background: #f8f8f8; border-color: #e2e8f0; opacity: .85; }

.scard-accent { width: 5px; align-self: stretch; flex-shrink: 0; }
.accent-active   { background: linear-gradient(180deg, #60a5fa, #2563eb); }
.accent-inactive { background: linear-gradient(180deg, #cbd5e1, #94a3b8); }

.scard-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; flex-shrink: 0; margin: 0 4px 0 20px;
}
.scard-body { flex: 1; padding: 18px 22px; min-width: 0; }
.scard-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.scard-name { font-family: 'Times New Roman', Times, serif; font-weight: 700; font-size: 1.05rem; color: #0f172a; letter-spacing: .02em; }
.scard-info {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .78rem; font-weight: 500; color: #64748b;
  background: #f8faff; border: 1.5px solid #e0e7ff; padding: 3px 10px; border-radius: 999px;
}
.vehicle-badge {
  padding: 4px 11px; border-radius: 999px; font-size: .7rem; font-weight: 700;
  background: #ede9fe; color: #7c3aed; border: 1px solid #ddd6fe;
}
.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 999px; font-size: .7rem; font-weight: 700; letter-spacing: .04em;
}
.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.badge-active   { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; }
.badge-inactive { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.scard-stats { display: flex; gap: 28px; flex-wrap: wrap; }
.sstat { display: flex; flex-direction: column; gap: 2px; }
.sstat-lbl { font-size: .68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
.sstat-val { font-size: .9rem; font-weight: 600; color: #334155; }
.sstat-val.date { font-size: .8rem; color: #94a3b8; }

/* ══ ACTIONS ══ */
.scard-actions { padding: 18px 18px 18px 0; flex-shrink: 0; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.btn-stats {
  padding: 8px 14px; border-radius: 10px; background: #eff6ff; border: 1px solid #bfdbfe;
  color: #2563eb; font-size: .78rem; font-weight: 700; cursor: pointer; transition: all .2s; white-space: nowrap;
}
.btn-stats:hover { background: #dbeafe; border-color: #93c5fd; }

.btn-deactivate {
  padding: 8px 14px; border-radius: 10px; background: #fef3c7; border: 1px solid #fde68a;
  color: #d97706; font-size: .78rem; font-weight: 700; cursor: pointer; transition: all .2s; white-space: nowrap;
}
.btn-deactivate:hover { background: #fde68a; border-color: #fcd34d; }

.btn-activate {
  padding: 8px 14px; border-radius: 10px; background: #dcfce7; border: 1px solid #bbf7d0;
  color: #16a34a; font-size: .78rem; font-weight: 700; cursor: pointer; transition: all .2s;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
}
.btn-activate:hover { background: #bbf7d0; border-color: #86efac; }

.no-result {
  text-align: center; padding: 48px; color: #94a3b8; font-size: .9rem;
  background: white; border-radius: 18px; border: 1px dashed #e0e7ff;
}

@media (max-width: 768px) {
  .scard { flex-wrap: wrap; }
  .scard-actions { padding: 0 16px 16px; }
  .hero-stats { gap: 14px; padding: 14px 18px; }
}
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .main-panel { padding: 0 14px 40px; }
  .search-input { width: 200px; }
}
</style>

<!-- Global styles cho modal (teleport ra body nên không dùng scoped) -->
<style>
.g-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10,15,30,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; backdrop-filter: blur(4px);
}
.g-modal {
  background: white; border-radius: 24px; padding: 40px 36px;
  width: 400px; max-width: 90vw; text-align: center;
  box-shadow: 0 30px 60px rgba(10,15,30,.25); border: 1px solid #e8edf8;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.g-modal-icon { font-size: 2.5rem; margin-bottom: 16px; }
.g-modal-title { font-family: 'Times New Roman', Times, serif; font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
.g-modal-sub { font-size: .85rem; color: #94a3b8; margin: -8px 0 20px; font-weight: 600; }
.g-modal-body { font-size: .9rem; color: #64748b; line-height: 1.7; margin: 0 0 28px; }
.g-modal-actions { display: flex; gap: 12px; justify-content: center; }

.g-btn-cancel {
  padding: 11px 24px; border-radius: 12px; background: #f8faff;
  border: 1.5px solid #e0e7ff; color: #64748b; font-size: .88rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
}
.g-btn-cancel:hover { background: #eff6ff; border-color: #bfdbfe; }

.g-btn-confirm {
  padding: 11px 24px; border-radius: 12px; border: none;
  color: white; font-size: .88rem; font-weight: 700; cursor: pointer; transition: all .2s;
}
.g-btn-confirm:hover { transform: translateY(-1px); }
.g-btn-confirm:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.g-btn-orange { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 14px rgba(217,119,6,.3); }
.g-btn-orange:hover { box-shadow: 0 8px 20px rgba(217,119,6,.4); }
.g-btn-green  { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 14px rgba(22,163,74,.3); }
.g-btn-green:hover  { box-shadow: 0 8px 20px rgba(22,163,74,.4); }

/* Stats modal */
.g-modal-stats { width: 440px; }
.stats-loading, .stats-error { padding: 20px; color: #94a3b8; font-size: .9rem; }
.stats-error { color: #dc2626; }
.stats-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  margin-bottom: 16px;
}
.stat-box {
  border-radius: 16px; padding: 18px 10px; display: flex; flex-direction: column; gap: 4px;
}
.stat-box-num { font-family: 'Times New Roman', Times, serif; font-size: 1.8rem; font-weight: 900; }
.stat-box-lbl { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.stat-assigned { background: #fef3c7; }
.stat-assigned .stat-box-num { color: #d97706; }
.stat-assigned .stat-box-lbl { color: #d97706; }
.stat-shipping { background: #dbeafe; }
.stat-shipping .stat-box-num { color: #2563eb; }
.stat-shipping .stat-box-lbl { color: #2563eb; }
.stat-delivered { background: #dcfce7; }
.stat-delivered .stat-box-num { color: #16a34a; }
.stat-delivered .stat-box-lbl { color: #16a34a; }
.stat-failed { background: #fee2e2; }
.stat-failed .stat-box-num { color: #dc2626; }
.stat-failed .stat-box-lbl { color: #dc2626; }
.stats-total { font-size: .85rem; color: #64748b; margin: 0 0 24px; font-weight: 600; }
</style>