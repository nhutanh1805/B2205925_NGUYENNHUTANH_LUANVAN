<template>
  <div class="point-page">

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
        <p class="hero-sub">1.000₫ = 1 điểm · Điểm có hiệu lực trong 15 ngày</p>

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

        <div v-if="!loading && expiringSoon" class="expiry-banner">
          <span class="expiry-ico">⏰</span>
          <span class="expiry-text">
            <strong>{{ expiringSoon.points.toLocaleString("vi-VN") }} điểm</strong>
            sẽ hết hạn trong
            <strong>{{ expiringSoon.daysLeft }} ngày</strong>
            — dùng ngay kẻo mất!
          </span>
        </div>
      </div>
    </div>

    <div class="main-panel">

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
            <span class="info-ico">⏰</span>
            <h3>Hạn dùng</h3>
            <p>Điểm hết hạn sau 15 ngày nếu chưa dùng</p>
          </div>
        </div>
      </section>

      <section class="batches-section" v-if="!loading && batches.length > 0">
        <button class="batches-toggle" @click="showBatches = !showBatches">
          <h2 class="section-title" style="margin-bottom:0">Chi tiết lô điểm còn hiệu lực</h2>
          <span class="toggle-arrow" :class="{ open: showBatches }">▾</span>
        </button>

        <div v-if="showBatches" class="batches-list">
          <div
            v-for="b in batches"
            :key="b._id"
            class="batch-row"
            :class="{ warn: b.daysLeft !== null && b.daysLeft <= 3 }"
          >
            <div class="batch-info">
              <span class="batch-points">{{ b.points.toLocaleString("vi-VN") }} điểm</span>
              <span class="batch-note">{{ b.note }}</span>
            </div>
            <span class="batch-expiry" v-if="b.daysLeft !== null">
              Còn {{ b.daysLeft }} ngày
              <span class="batch-expiry-date">({{ formatDate(b.expiresAt) }})</span>
            </span>
          </div>
        </div>
      </section>

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
            :class="rowClass(tx)"
          >
            <div class="tx-icon">{{ txIcon(tx) }}</div>
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
import { ref, computed, onMounted } from "vue"
import PointService from "@/services/point.service"

const EXPIRY_WARN_DAYS = 3

const balance = ref(0)
const history = ref([])
const batches = ref([])
const loading = ref(true)
const showBatches = ref(false)

const expiringSoon = computed(() => {
  const nearest = batches.value[0]
  if (!nearest || nearest.daysLeft === null) return null
  if (nearest.daysLeft > EXPIRY_WARN_DAYS) return null
  return nearest
})

const load = async () => {
  loading.value = true
  try {
    const [bal, hist, batch] = await Promise.all([
      PointService.getBalance(),
      PointService.getHistory(),
      PointService.getBatches(),
    ])
    balance.value = bal.balance || 0
    history.value = hist.history || []
    batches.value = batch.batches || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const ICONS = {
  earn: "⬆️",
  refund: "↩️",
  redeem: "🎟️",
  expire: "⏰",
}
const txIcon = (tx) => ICONS[tx.type] || "🎟️"

const rowClass = (tx) => {
  if (tx.type === "expire") return "expire"
  return tx.points > 0 ? "earn" : "spend"
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

.balance-skeleton { min-width: 240px; }
.sk-circle { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,.1); flex-shrink: 0; animation: shimmer 1.4s infinite; }
.sk-text { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk-line { height: 14px; border-radius: 8px; background: rgba(255,255,255,.12); animation: shimmer 1.4s infinite; }
.w20 { width: 20%; } .w35 { width: 35%; } .w40 { width: 40%; } .w55 { width: 55%; } .w60 { width: 60%; }
@keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:.4; } }

.expiry-banner {
  display: inline-flex; align-items: center; gap: 10px;
  margin-top: 16px; padding: 12px 22px;
  background: rgba(239,68,68,.12); border: 1px solid rgba(248,113,113,.4);
  border-radius: 999px; backdrop-filter: blur(8px);
}
.expiry-ico { font-size: 1.1rem; flex-shrink: 0; }
.expiry-text { font-size: .82rem; color: #fecaca; }
.expiry-text strong { color: #fca5a5; font-weight: 800; }

.main-panel {
  max-width: 860px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
  display: flex; flex-direction: column; gap: 24px;
}

.info-section,
.history-section,
.batches-section {
  background: white; border-radius: 24px; padding: 28px;
  box-shadow: 0 12px 40px rgba(37,99,235,.08);
  border: 1.5px solid #e8edf8;
}

.section-title {
  font-size: 1.1rem; font-weight: 900; color: #0f172a; margin-bottom: 20px;
}

.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.info-card {
  text-align: center; padding: 20px 12px;
  background: #f8faff; border-radius: 16px;
  border: 1.5px solid #e8edf8;
}
.info-ico { font-size: 1.8rem; display: block; margin-bottom: 10px; }
.info-card h3 { font-size: .95rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.info-card p  { font-size: .8rem; color: #64748b; }

.batches-toggle {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: none; border: none; cursor: pointer; padding: 0;
}
.toggle-arrow {
  font-size: 1.1rem; color: #94a3b8; transition: transform .2s ease;
}
.toggle-arrow.open { transform: rotate(180deg); }

.batches-list { display: flex; flex-direction: column; margin-top: 16px; }
.batch-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  border-bottom: 1.5px solid #f0f4ff;
}
.batch-row.warn { background: #fef2f2; border-radius: 12px; border-bottom-color: transparent; }
.batch-row:last-child { border-bottom: none; }

.batch-info { display: flex; flex-direction: column; }
.batch-points { font-weight: 800; color: #0f172a; font-size: .92rem; }
.batch-note { font-size: .75rem; color: #94a3b8; margin-top: 2px; }

.batch-expiry { font-size: .82rem; font-weight: 700; color: #16a34a; text-align: right; white-space: nowrap; }
.batch-row.warn .batch-expiry { color: #e11d48; }
.batch-expiry-date { display: block; font-size: .7rem; font-weight: 500; color: #94a3b8; }

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
.history-row.earn   .tx-points { color: #16a34a; }
.history-row.spend  .tx-points { color: #e11d48; }
.history-row.expire .tx-points { color: #94a3b8; }
.history-row.expire .tx-note   { color: #94a3b8; }

@media (max-width: 640px) {
  .hero { padding: 48px 16px 60px; }
  .main-panel { padding: 0 12px 40px; }
  .info-grid { grid-template-columns: 1fr; }
  .balance-card { flex-direction: column; gap: 10px; text-align: center; }
}
</style>