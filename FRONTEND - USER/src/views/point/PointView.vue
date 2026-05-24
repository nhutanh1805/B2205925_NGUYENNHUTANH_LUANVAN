<template>
  <div class="point-page">

    <!-- HERO -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Điểm thưởng của bạn
        </div>
        <h1 class="hero-title">Tích<br/><em>điểm</em></h1>
        <p class="hero-sub">1.000₫ = 1 điểm · Dùng điểm đổi ưu đãi hấp dẫn</p>

        <div class="balance-card" v-if="!loading">
          <div class="balance-icon"></div>
          <div class="balance-info">
            <span class="balance-num">{{ balance.toLocaleString("vi-VN") }}</span>
            <span class="balance-lbl">Điểm hiện có</span>
          </div>
        </div>
        <div class="balance-card balance-skeleton" v-else>
          <div class="sk-circle"></div>
          <div class="sk-text">
            <div class="sk-line w60"></div>
            <div class="sk-line w40"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="main-panel">

      <!-- HOW IT WORKS -->
      <section class="info-section">
        <h2 class="section-title">Cách tích điểm</h2>
        <div class="info-grid">
          <div class="info-card">
            <span class="info-ico">🛍️</span>
            <h3>Đặt hàng</h3>
            <p>Mỗi 1.000₫ = 1 điểm thưởng</p>
          </div>
          <div class="info-card">
            <span class="info-ico">🎁</span>
            <h3>Đổi ưu đãi</h3>
            <p>Dùng điểm giảm giá đơn hàng</p>
          </div>
          <div class="info-card">
            <span class="info-ico">📦</span>
            <h3>Huỷ đơn</h3>
            <p>Điểm được hoàn tự động</p>
          </div>
        </div>
      </section>

      <!-- HISTORY -->
      <section class="history-section">
        <h2 class="section-title">Lịch sử giao dịch</h2>

        <div v-if="loading" class="skeleton-list">
          <div v-for="i in 4" :key="i" class="skeleton-row">
            <div class="sk-dot"></div>
            <div class="sk-text">
              <div class="sk-line w55"></div>
              <div class="sk-line w35"></div>
            </div>
            <div class="sk-line w20" style="margin-left:auto"></div>
          </div>
        </div>

        <div v-else-if="history.length === 0" class="empty-history">
          <span>📭</span>
          <p>Chưa có giao dịch điểm nào</p>
        </div>

        <div v-else class="history-list">
          <div
            v-for="tx in history"
            :key="tx._id"
            class="history-row"
            :class="tx.points > 0 ? 'earn' : 'spend'"
          >
            <div class="tx-icon">
              {{ tx.type === 'earn' ? '⬆️' : tx.type === 'refund' ? '↩️' : '🎟️' }}
            </div>
            <div class="tx-info">
              <span class="tx-note">{{ tx.note }}</span>
              <span class="tx-date">{{ formatDate(tx.createdAt) }}</span>
            </div>
            <span class="tx-points">
              {{ tx.points > 0 ? '+' : '' }}{{ tx.points.toLocaleString("vi-VN") }} đ
            </span>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import PointService from "@/services/point.service"

const balance = ref(0)
const history = ref([])
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    const [bal, hist] = await Promise.all([
      PointService.getBalance(),
      PointService.getHistory(),
    ])
    balance.value = bal.balance || 0
    history.value = hist.history || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

onMounted(load)
</script>

<style scoped>
.point-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* HERO */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 64px 32px 80px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%,  rgba(234,179,8,.25), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(249,115,22,.25), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 280px; height: 280px; background: rgba(234,179,8,.2);  top: -60px; left: -40px; }
.hero-orb-2 { width: 220px; height: 220px; background: rgba(249,115,22,.18); bottom: -50px; right: -30px; }

.hero-content { position: relative; z-index: 2; max-width: 600px; margin: auto; }

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
  background: #eab308; box-shadow: 0 0 8px #eab308;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}

.hero-title {
  font-size: clamp(2.4rem, 7vw, 4rem); font-weight: 900; color: white;
  line-height: 1.05; letter-spacing: -.02em; margin-bottom: 12px;
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #eab308, #f97316, #ec4899);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: .95rem; color: rgba(255,255,255,.5); margin-bottom: 32px; }

.balance-card {
  display: inline-flex; align-items: center; gap: 18px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15);
  border-radius: 20px; padding: 20px 32px; backdrop-filter: blur(16px);
}
.balance-icon { font-size: 2.2rem; line-height: 1; }
.balance-num  { display: block; font-size: 2rem; font-weight: 900; color: #fbbf24; line-height: 1; }
.balance-lbl  { display: block; font-size: .72rem; color: rgba(255,255,255,.45); letter-spacing: .07em; text-transform: uppercase; margin-top: 4px; }

/* SKELETON */
.balance-skeleton { min-width: 240px; }
.sk-circle { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,.1); flex-shrink: 0; animation: shimmer 1.4s infinite; }
.sk-text { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk-line { height: 14px; border-radius: 8px; background: rgba(255,255,255,.12); animation: shimmer 1.4s infinite; }
.w20 { width: 20%; } .w35 { width: 35%; } .w40 { width: 40%; } .w55 { width: 55%; } .w60 { width: 60%; }
@keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:.4; } }

/* MAIN */
.main-panel {
  max-width: 860px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
  display: flex; flex-direction: column; gap: 24px;
}

/* SECTIONS */
.info-section,
.history-section {
  background: white; border-radius: 24px; padding: 28px;
  box-shadow: 0 12px 40px rgba(37,99,235,.08);
  border: 1.5px solid #e8edf8;
}

.section-title {
  font-size: 1.1rem; font-weight: 900; color: #0f172a; margin-bottom: 20px;
}

/* INFO GRID */
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.info-card {
  text-align: center; padding: 20px 12px;
  background: #f8faff; border-radius: 16px;
  border: 1.5px solid #e8edf8;
}
.info-ico { font-size: 1.8rem; display: block; margin-bottom: 10px; }
.info-card h3 { font-size: .95rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.info-card p  { font-size: .8rem; color: #64748b; }

/* HISTORY */
.skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.skeleton-row  { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1.5px solid #f0f4ff; }
.sk-dot        { width: 36px; height: 36px; border-radius: 50%; background: #e8edf8; flex-shrink: 0; animation: shimmer 1.4s infinite; }

.empty-history { text-align: center; padding: 40px; color: #94a3b8; }
.empty-history span { font-size: 2rem; display: block; margin-bottom: 8px; }

.history-list { display: flex; flex-direction: column; }
.history-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 0; border-bottom: 1.5px solid #f0f4ff;
}
.history-row:last-child { border-bottom: none; }

.tx-icon { font-size: 1.4rem; flex-shrink: 0; width: 36px; text-align: center; }
.tx-info { flex: 1; }
.tx-note { display: block; font-size: .9rem; font-weight: 700; color: #0f172a; }
.tx-date { display: block; font-size: .75rem; color: #94a3b8; margin-top: 2px; }

.tx-points {
  font-weight: 900; font-size: 1rem; flex-shrink: 0;
}
.history-row.earn  .tx-points { color: #16a34a; }
.history-row.spend .tx-points { color: #e11d48; }

/* MOBILE */
@media (max-width: 640px) {
  .hero { padding: 48px 16px 60px; }
  .main-panel { padding: 0 12px 40px; }
  .info-grid { grid-template-columns: 1fr; }
  .balance-card { flex-direction: column; gap: 10px; text-align: center; }
}
</style>