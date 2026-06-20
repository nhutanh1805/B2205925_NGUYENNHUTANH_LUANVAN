<template>
  <div class="support-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Quản lý hỗ trợ
        </div>
        <h1 class="hero-title">Yêu cầu<br/><em>CSKH</em></h1>
        <p class="hero-sub">Theo dõi · Xử lý bảo hành &amp; đổi trả</p>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">{{ stats.pending }}</span>
            <span class="stat-lbl">Chờ xử lý</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ stats.processing }}</span>
            <span class="stat-lbl">Đang xử lý</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ stats.done }}</span>
            <span class="stat-lbl">Hoàn thành</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <div class="panel-header">
        <h2 class="panel-title">Danh sách yêu cầu</h2>
        <span class="panel-count" v-if="!loading && !error">
          <span class="panel-count-num">{{ items.length }}</span> yêu cầu
        </span>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">Trạng thái</span>
          <div class="pill-wrap">
            <button
              v-for="s in statusOptions" :key="s.value"
              class="filter-pill" :class="{ active: filterStatus === s.value }"
              @click="setStatus(s.value)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">Loại</span>
          <div class="pill-wrap">
            <button
              v-for="t in typeOptions" :key="t.value"
              class="filter-pill" :class="{ active: filterType === t.value }"
              @click="setType(t.value)"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải...</p>
      </div>

      <div v-else-if="error" class="state-box state-box--error">
        <div class="state-icon">⚠</div>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="items.length === 0" class="state-box">
        <div class="state-icon"></div>
        <p>Không có yêu cầu nào.</p>
      </div>

      <div v-else class="support-grid">
        <div
          v-for="(req, idx) in items"
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
            <button class="view-btn" @click.stop="$router.push(`/support/${req._id}`)">
              Xem chi tiết
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="chevron-icon">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">‹</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="changePage(page + 1)">›</button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { AdminSupportAPI } from "@/services/support.service";

const items        = ref([]);
const loading      = ref(false);
const error        = ref(null);
const page         = ref(1);
const totalPages   = ref(1);
const filterStatus = ref("");
const filterType   = ref("");

const statusOptions = [
  { value: "",           label: "Tất cả" },
  { value: "pending",    label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "done",       label: "Hoàn thành" },
  { value: "rejected",   label: "Từ chối" },
  { value: "refunded",   label: "Đã hoàn tiền" },
];

const typeOptions = [
  { value: "",         label: "Tất cả" },
  { value: "warranty", label: "Bảo hành" },
  { value: "return",   label: "Đổi trả" },
];

const stats = computed(() => ({
  pending:    items.value.filter(i => i.status === "pending").length,
  processing: items.value.filter(i => i.status === "processing").length,
  done:       items.value.filter(i => i.status === "done").length,
}));

async function fetchList() {
  loading.value = true;
  error.value   = null;
  try {
    const { data } = await AdminSupportAPI.getAllRequests({
      status: filterStatus.value,
      type:   filterType.value,
      page:   page.value,
    });
    items.value      = data.items;
    totalPages.value = data.totalPages;
  } catch (e) {
    error.value = e?.response?.data?.message || "Không tải được danh sách";
  } finally {
    loading.value = false;
  }
}

function setStatus(val) { filterStatus.value = val; applyFilter(); }
function setType(val)   { filterType.value = val; applyFilter(); }
function applyFilter()  { page.value = 1; fetchList(); }
function changePage(p)  { page.value = p; fetchList(); }

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

onMounted(fetchList);
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
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; margin-bottom: 36px; }

.hero-stats {
  display: inline-flex; align-items: center; gap: 24px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 18px 32px; backdrop-filter: blur(16px);
}
.hero-stat { text-align: center; }
.stat-num { display: block; font-size: 1.6rem; font-weight: 900; color: white; line-height: 1; }
.stat-lbl { font-size: .7rem; color: rgba(255,255,255,.5); letter-spacing: .07em; text-transform: uppercase; margin-top: 3px; display: block; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.15); }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 1100px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18px; gap: 12px; flex-wrap: wrap;
}
.panel-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; }
.panel-count {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .8rem; font-weight: 700;
  padding: 7px 16px; border-radius: 999px;
}
.panel-count-num { font-size: .92rem; }

/* ══ FILTER BAR ══ */
.filter-bar {
  background: white; border-radius: 20px; padding: 18px 20px;
  box-shadow: 0 8px 40px rgba(10,15,30,.1);
  border: 1px solid rgba(37,99,235,.1);
  margin-bottom: 22px;
  display: flex; flex-direction: column; gap: 14px;
}
.filter-group { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.filter-label {
  font-size: .75rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .05em;
  flex-shrink: 0; min-width: 76px;
}
.pill-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-pill {
  padding: 7px 16px; border-radius: 999px;
  border: 1.5px solid #e0e7ff; background: white;
  color: #4f46e5; font-weight: 600; font-size: .8rem;
  cursor: pointer; transition: all .2s;
}
.filter-pill:hover { background: #eff6ff; border-color: #a5b4fc; }
.filter-pill.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border-color: transparent;
  box-shadow: 0 4px 12px rgba(37,99,235,.3);
}

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
.support-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }

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
.view-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: none; border: none; cursor: pointer;
  font-size: .78rem; font-weight: 700; color: #4f46e5;
  padding: 4px 0; transition: color .2s;
}
.chevron-icon { width: 15px; height: 15px; transition: transform .2s; }
.support-card:hover .chevron-icon { transform: translateX(3px); }

/* ══ PAGINATION ══ */
.pagination { display: flex; justify-content: center; align-items: center; gap: 18px; margin-top: 12px; }
.page-btn {
  width: 38px; height: 38px; border-radius: 12px;
  border: 1.5px solid #e0e7ff; background: white; color: #4f46e5;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(37,99,235,.06); transition: all .2s;
}
.page-btn:hover:not(:disabled) { background: #eff6ff; border-color: #a5b4fc; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-info { font-size: .85rem; font-weight: 700; color: #475569; }

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .hero-stats { gap: 16px; padding: 14px 20px; }
  .main-panel { padding: 0 14px 40px; }
  .panel-header { flex-direction: column; align-items: stretch; }
  .filter-group { flex-direction: column; align-items: flex-start; gap: 8px; }
  .filter-label { min-width: auto; }
}
</style>