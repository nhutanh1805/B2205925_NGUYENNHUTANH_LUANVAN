<template>
  <div class="support-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Trung tâm hỗ trợ
        </div>
        <h1 class="hero-title">Yêu cầu<br/><em>hỗ trợ</em></h1>
        <p class="hero-sub">Theo dõi bảo hành &amp; đổi trả của bạn</p>
      </div>
    </div>

    <div class="main-panel">

      <div class="panel-header">
        <span class="panel-count" v-if="!loading && !error">
          {{ requests.length }} yêu cầu
        </span>
        <router-link to="/support/create" class="create-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="plus-icon">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tạo yêu cầu mới
        </router-link>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải...</p>
      </div>

      <div v-else-if="error" class="state-box state-box--error">
        <div class="state-icon">⚠</div>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="requests.length === 0" class="state-box">
        <div class="state-icon">🗂️</div>
        <p>Bạn chưa có yêu cầu nào.</p>
      </div>

      <div v-else class="support-grid">
        <div
          v-for="(req, idx) in requests"
          :key="req._id"
          class="support-card"
          :style="`--delay:${idx * 0.04}s`"
          @click="$router.push(`/support/${req._id}`)"
        >
          <div class="support-card-top">
            <span class="type-pill" :class="`type-pill--${req.type}`">
              {{ req.type === "warranty" ? "Bảo hành" : "Đổi trả" }}
            </span>
            <span class="status-pill" :class="`status--${req.status}`">
              {{ statusLabel(req.status) }}
            </span>
          </div>
          <p class="support-card-reason">{{ req.reason }}</p>
          <div class="support-card-bottom">
            <time class="support-card-date">{{ formatDate(req.createdAt) }}</time>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="chevron-icon">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { SupportAPI } from "@/services/support.service";

const userId   = JSON.parse(localStorage.getItem("user") || "{}")?._id ?? null;
const requests = ref([]);
const loading  = ref(false);
const error    = ref(null);

async function fetchRequests() {
  loading.value = true;
  error.value   = null;
  try {
    const { data } = await SupportAPI.getMyRequests(userId);
    requests.value = data.requests;
  } catch (e) {
    error.value = e?.response?.data?.message || "Không tải được danh sách";
  } finally {
    loading.value = false;
  }
}

function statusLabel(status) {
  const map = {
    pending:    "Chờ xử lý",
    processing: "Đang xử lý",
    done:       "Hoàn thành",
    rejected:   "Từ chối",
    refunded:   "Đã hoàn tiền",
  };
  return map[status] ?? status;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("vi-VN");
}

onMounted(fetchRequests);
</script>

<style scoped>
.support-page {
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
  margin-bottom: 22px; backdrop-filter: blur(8px);
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
  font-size: clamp(2.2rem, 6vw, 3.6rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.02em; margin-bottom: 14px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 800px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
}
.panel-count {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .8rem; font-weight: 700;
  padding: 7px 16px; border-radius: 999px;
}
.create-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 20px; border-radius: 13px; text-decoration: none;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white;
  font-weight: 700; font-size: .86rem;
  box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: transform .2s, box-shadow .2s;
}
.create-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.plus-icon { width: 15px; height: 15px; }

/* ══ STATE BOX ══ */
.state-box {
  background: white; border-radius: 22px; padding: 60px 20px;
  text-align: center; color: #94a3b8; font-size: .95rem;
  border: 1.5px solid #e8edf8; box-shadow: 0 4px 20px rgba(37,99,235,.05);
}
.state-icon { font-size: 2.6rem; margin-bottom: 12px; display: block; }
.state-box--error p { color: #e11d48; font-weight: 600; }
.spinner {
  width: 34px; height: 34px; margin: 0 auto 16px;
  border: 3px solid #e0e7ff; border-top-color: #2563eb;
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ GRID ══ */
.support-grid { display: flex; flex-direction: column; gap: 14px; }

.support-card {
  background: white; border-radius: 18px; padding: 18px 20px;
  border: 1.5px solid #e8edf8; cursor: pointer;
  transition: transform .2s, box-shadow .2s, border-color .2s;
  animation: cardIn .4s ease both; animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.support-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(37,99,235,.12);
  border-color: #a5b4fc;
}

.support-card-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px; gap: 10px;
}
.type-pill {
  font-size: .76rem; font-weight: 700; padding: 4px 12px;
  border-radius: 999px; letter-spacing: .02em;
}
.type-pill--warranty { background: #eff6ff; color: #2563eb; }
.type-pill--return    { background: #f5f3ff; color: #7c3aed; }

.status-pill {
  font-size: .74rem; font-weight: 700; padding: 4px 12px; border-radius: 999px;
}
.status--pending    { background: #fef3c7; color: #92400e; }
.status--processing { background: #dbeafe; color: #1e40af; }
.status--done        { background: #d1fae5; color: #065f46; }
.status--rejected    { background: #fee2e2; color: #991b1b; }
.status--refunded    { background: #ede9fe; color: #5b21b6; }

.support-card-reason {
  font-size: .92rem; color: #334155; margin: 0 0 12px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.support-card-bottom {
  display: flex; align-items: center; justify-content: space-between;
}
.support-card-date { font-size: .76rem; color: #94a3b8; }
.chevron-icon { width: 16px; height: 16px; color: #cbd5e1; transition: transform .2s; }
.support-card:hover .chevron-icon { transform: translateX(3px); color: #4f46e5; }

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .main-panel { padding: 0 14px 40px; }
  .panel-header { flex-direction: column; align-items: stretch; }
  .create-btn { justify-content: center; }
}
</style>