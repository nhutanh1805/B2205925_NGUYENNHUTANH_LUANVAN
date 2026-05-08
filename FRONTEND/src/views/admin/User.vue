<template>
  <div class="admin-users-page">

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
          <em>người dùng</em>
        </h1>

        <p class="hero-sub">Xem · Tìm kiếm · Xóa tài khoản</p>

        <div class="hero-stats" v-if="!loading">
          <div class="hero-stat">
            <span class="stat-num">{{ users.length }}</span>
            <span class="stat-lbl">Tổng tài khoản</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ adminCount }}</span>
            <span class="stat-lbl">Admin</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ userCount }}</span>
            <span class="stat-lbl">Người dùng</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <!-- Top bar -->
      <div class="top-bar">
        <div class="result-info">
          <span class="result-num">{{ filtered.length }}</span> người dùng
        </div>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon-svg">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="search"
            class="search-input"
            placeholder="Tìm tên hoặc email..."
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
        <div class="empty-icon">⚠️</div>
        <h2 class="empty-title">Có lỗi xảy ra</h2>
        <p class="empty-desc">{{ error }}</p>
        <button class="btn-explore" @click="loadUsers">Thử lại →</button>
      </div>

      <!-- EMPTY -->
      <div v-else-if="!users.length" class="empty-state">
        <div class="empty-icon">👤</div>
        <h2 class="empty-title">Chưa có người dùng nào</h2>
        <p class="empty-desc">Khi có tài khoản mới, chúng sẽ xuất hiện tại đây</p>
      </div>

      <!-- USER CARDS -->
      <div v-else class="users-list">
        <div
          v-for="(user, idx) in filtered"
          :key="user._id"
          class="ucard"
          :style="`--delay:${idx * 0.04}s`"
        >
          <!-- Accent bar -->
          <div class="ucard-accent" :class="`accent-${user.role || 'user'}`"></div>

          <!-- Avatar -->
          <div class="ucard-avatar" :style="avatarStyle(user.name)">
            {{ initials(user.name) }}
          </div>

          <!-- Body -->
          <div class="ucard-body">
            <div class="ucard-top">
              <span class="ucard-name">{{ user.name }}</span>
              <span class="ucard-email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {{ user.email }}
              </span>
              <span class="role-badge" :class="`badge-${user.role || 'user'}`">
                <i class="dot"></i>{{ roleLabel(user.role) }}
              </span>
            </div>

            <div class="ucard-stats">
              <div class="ustat">
                <span class="ustat-lbl">ID</span>
                <span class="ustat-val">#{{ user._id?.slice(-8).toUpperCase() }}</span>
              </div>
              <div class="ustat">
                <span class="ustat-lbl">Ngày tạo</span>
                <span class="ustat-val date">{{ formatDate(user.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="ucard-actions" @click.stop>
            <button @click="confirmDelete(user)" class="btn-delete">
              Xóa <span class="del-icon">✕</span>
            </button>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="no-result">
          Không tìm thấy kết quả cho "<strong>{{ search }}</strong>"
        </div>
      </div>

    </div>

    <!-- ══ DELETE MODAL ══ -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal">
        <div class="modal-icon">🗑️</div>
        <h3 class="modal-title">Xác nhận xóa</h3>
        <p class="modal-body">
          Bạn có chắc muốn xóa tài khoản
          <strong>{{ deleteTarget.name }}</strong>?<br/>
          Hành động này không thể hoàn tác.
        </p>
        <div class="modal-actions">
          <button class="btn-cancel-modal" @click="deleteTarget = null">Hủy</button>
          <button class="btn-confirm" @click="handleDelete">Xóa tài khoản</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import userAuthService from "@/services/userAuth.service"

const users = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref("")
const deleteTarget = ref(null)

const adminCount = computed(() => users.value.filter(u => u.role === "admin").length)
const userCount  = computed(() => users.value.filter(u => !u.role || u.role === "user").length)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  )
})

const roleLabel = (role) => ({ admin: "Admin", moderator: "Mod", user: "User" }[role] || "User")

const formatDate = (d) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN")
}

const initials = (name = "") =>
  name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase()

const avatarStyle = (name = "") => {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return {
    background: `hsl(${hue},55%,88%)`,
    color: `hsl(${hue},55%,32%)`,
  }
}

const loadUsers = async () => {
  loading.value = true
  error.value = null
  try {
    users.value = await userAuthService.findAll()
  } catch (err) {
    error.value = err.message || "Không thể tải danh sách người dùng"
  } finally {
    loading.value = false
  }
}

const confirmDelete = (user) => { deleteTarget.value = user }

const handleDelete = async () => {
  try {
    await userAuthService.delete(deleteTarget.value._id)
    users.value = users.value.filter(u => u._id !== deleteTarget.value._id)
    deleteTarget.value = null
  } catch (err) {
    alert("Xóa thất bại: " + err.message)
  }
}

onMounted(() => loadUsers())
</script>

<style scoped>
.admin-users-page {
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
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 900; color: white;
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
  display: block;
  font-family: 'Times New Roman', Times, serif;
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
  padding: 10px 14px 10px 36px;
  border: 1.5px solid #e0e7ff; border-radius: 12px;
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
.empty-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.8rem; font-weight: 700; color: #0f172a; margin: 0 0 10px;
}
.empty-desc { color: #94a3b8; margin-bottom: 32px; }
.btn-explore {
  display: inline-block; padding: 13px 32px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-weight: 700; font-size: .95rem;
  border: none; cursor: pointer;
  box-shadow: 0 8px 24px rgba(37,99,235,.3); transition: all .2s;
}
.btn-explore:hover { transform: translateY(-2px); }

/* ══ USER CARDS ══ */
.users-list { display: flex; flex-direction: column; gap: 14px; }

.ucard {
  background: white; border-radius: 18px; border: 1.5px solid #e8edf8;
  display: flex; align-items: center; overflow: hidden;
  transition: transform .25s cubic-bezier(.175,.885,.32,1.275), box-shadow .25s, border-color .25s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ucard:hover {
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 16px 40px rgba(37,99,235,.13);
  border-color: #a5b4fc;
}

.ucard-accent { width: 5px; align-self: stretch; flex-shrink: 0; }
.accent-admin     { background: linear-gradient(180deg, #fca5a5, #ef4444); }
.accent-moderator { background: linear-gradient(180deg, #fcd34d, #f59e0b); }
.accent-user      { background: linear-gradient(180deg, #60a5fa, #2563eb); }

.ucard-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; flex-shrink: 0;
  margin: 0 4px 0 20px;
}

.ucard-body { flex: 1; padding: 18px 22px; min-width: 0; }

.ucard-top {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px; flex-wrap: wrap;
}
.ucard-name {
  font-family: 'Times New Roman', Times, serif;
  font-weight: 700; font-size: 1.05rem; color: #0f172a; letter-spacing: .02em;
}
.ucard-email {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .78rem; font-weight: 500; color: #64748b;
  background: #f8faff; border: 1.5px solid #e0e7ff;
  padding: 3px 10px; border-radius: 999px;
}

.role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 999px;
  font-size: .7rem; font-weight: 700; letter-spacing: .04em;
}
.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.badge-admin     { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.badge-moderator { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.badge-user      { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; }

.ucard-stats { display: flex; gap: 28px; flex-wrap: wrap; }
.ustat { display: flex; flex-direction: column; gap: 2px; }
.ustat-lbl { font-size: .68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
.ustat-val { font-size: .9rem; font-weight: 600; color: #334155; }
.ustat-val.date { font-size: .8rem; color: #94a3b8; }

.ucard-actions { padding: 18px 18px 18px 0; flex-shrink: 0; }
.btn-delete {
  padding: 8px 16px; border-radius: 10px;
  background: #fee2e2; border: 1px solid #fecaca;
  color: #dc2626; font-size: .78rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
  display: inline-flex; align-items: center; gap: 6px;
  white-space: nowrap;
}
.btn-delete:hover { background: #fecaca; border-color: #fca5a5; }
.del-icon { font-size: .7rem; }

.no-result {
  text-align: center; padding: 48px; color: #94a3b8; font-size: .9rem;
  background: white; border-radius: 18px; border: 1px dashed #e0e7ff;
}

/* ══ MODAL ══ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10,15,30,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; backdrop-filter: blur(4px);
}
.modal {
  background: white; border-radius: 24px; padding: 40px 36px;
  width: 400px; text-align: center;
  box-shadow: 0 30px 60px rgba(10,15,30,.25);
  border: 1px solid #e8edf8;
}
.modal-icon { font-size: 2.5rem; margin-bottom: 16px; }
.modal-title {
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 12px;
}
.modal-body { font-size: .9rem; color: #64748b; line-height: 1.7; margin: 0 0 28px; }
.modal-actions { display: flex; gap: 12px; justify-content: center; }

.btn-cancel-modal {
  padding: 11px 24px; border-radius: 12px;
  background: #f8faff; border: 1.5px solid #e0e7ff;
  color: #64748b; font-size: .88rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
}
.btn-cancel-modal:hover { background: #eff6ff; border-color: #bfdbfe; }

.btn-confirm {
  padding: 11px 24px; border-radius: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none; color: white; font-size: .88rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 4px 14px rgba(220,38,38,.3);
}
.btn-confirm:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(220,38,38,.4); }

@media (max-width: 768px) {
  .ucard { flex-wrap: wrap; }
  .ucard-actions { padding: 0 16px 16px; }
  .hero-stats { gap: 14px; padding: 14px 18px; }
}
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .main-panel { padding: 0 14px 40px; }
  .search-input { width: 200px; }
}
</style>