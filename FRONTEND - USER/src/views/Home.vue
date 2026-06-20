<template>
  <div class="min-h-screen ts-root">

    <!-- ══════════════════════════════════════
         FLOATING VIDEO CONTROL
    ══════════════════════════════════════ -->
    <div class="ts-video-fab">
      <button class="ts-fab-btn" @click="toggleAllVideos">
        <span class="ts-fab-icon">{{ allPlaying ? '⏸' : '▶' }}</span>
        <span class="ts-fab-label">{{ allPlaying ? 'Dừng video' : 'Phát video' }}</span>
      </button>
    </div>

    <!-- ══════════════════════════════════════
         HERO SECTION
    ══════════════════════════════════════ -->
    <section class="ts-hero" :style="{ backgroundImage: `url(${heroImage})` }">
      <!-- Layered overlays -->
      <div class="ts-hero-overlay ts-hero-overlay--dark"></div>
      <div class="ts-hero-overlay ts-hero-overlay--gradient"></div>
      <div class="ts-hero-noise"></div>

      <!-- Floating orbs -->
      <div class="ts-orb ts-orb--1"></div>
      <div class="ts-orb ts-orb--2"></div>
      <div class="ts-orb ts-orb--3"></div>

      <div class="ts-hero-content">
        <div class="ts-hero-badge">
          <span class="ts-badge-dot"></span>
          Hot Deal 2026 · Phụ Kiện Điện Thoại
        </div>

        <h1 class="ts-hero-title">
          <span class="ts-title-line ts-title-line--dim">NhutAnhStore</span>
          <span class="ts-title-line ts-title-line--main">Phụ Kiện</span>
          <span class="ts-title-line ts-title-line--accent">Chính Hãng</span>
        </h1>

        <p class="ts-hero-sub">
          Ốp lưng · Cáp sạc · Tai nghe · Sạc nhanh · Pin dự phòng
        </p>

        <div class="ts-hero-actions">
          <router-link to="/products" class="ts-btn ts-btn--primary">
            <span>Mua Ngay</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </router-link>
          <router-link to="/products" class="ts-btn ts-btn--ghost">
            <span>Khám phá</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </router-link>
        </div>

        <div class="ts-hero-stats">
          <div class="ts-stat"><strong>20+</strong><span>Sản phẩm</span></div>
          <div class="ts-stat-divider"></div>
          <div class="ts-stat"><strong>20+</strong><span>Khách hàng</span></div>
          <div class="ts-stat-divider"></div>
          <div class="ts-stat"><strong>4.9★</strong><span>Đánh giá</span></div>
        </div>
      </div>

    </section>

    <!-- ══════════════════════════════════════
         CATEGORY STRIP
    ══════════════════════════════════════ -->
    <section class="ts-cats">
      <div class="ts-container">
        <div class="ts-cats-label">DANH MỤC</div>
        <div class="ts-cats-grid">
          <div v-for="brand in brands" :key="brand.name" class="ts-cat-item">
            <div class="ts-cat-img-wrap">
              <img :src="brand.logo" :alt="brand.name" />
              <div class="ts-cat-glow"></div>
            </div>
            <span>{{ brand.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         MAIN VIDEO BANNER
    ══════════════════════════════════════ -->
    <section class="ts-video-main">
      <div class="ts-container">
        <div class="ts-section-header">
          <h2 class="ts-section-title">Bộ sưu tập <em>2026</em></h2>
          <p class="ts-section-sub">Khám phá xu hướng phụ kiện smartphone mới nhất</p>
        </div>
        <div class="ts-video-frame">
          <div class="ts-video-border-glow"></div>
          <video
            ref="mainVideoRef"
            autoplay muted loop playsinline
            class="ts-video-el"
          >
            <source :src="mainVideo" type="video/mp4" />
          </video>
          <div class="ts-video-corner ts-video-corner--tl"></div>
          <div class="ts-video-corner ts-video-corner--tr"></div>
          <div class="ts-video-corner ts-video-corner--bl"></div>
          <div class="ts-video-corner ts-video-corner--br"></div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         SMALL VIDEOS
    ══════════════════════════════════════ -->
    <section class="ts-video-grid-section">
      <div class="ts-container">
        <h2 class="ts-section-title text-center mb-4">🎬 Video phụ kiện</h2>
        <div class="ts-small-video-grid">
          <div v-for="(video, i) in smallVideos" :key="i" class="ts-small-vid">
            <video :src="video" autoplay muted loop playsinline></video>
            <div class="ts-small-vid-overlay"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         HOT PRODUCTS
    ══════════════════════════════════════ -->
    <section class="ts-hot-section">
      <div class="ts-container">
        <div class="ts-section-row">
          <h2 class="ts-section-title">🔥 <em>Bán chạy</em> nhất</h2>
          <router-link to="/products" class="ts-link-all">Xem tất cả →</router-link>
        </div>
        <div class="ts-hot-scroll">
          <div
            v-for="product in hotProducts"
            :key="product._id"
            class="ts-hot-card"
          >
            <router-link :to="`/products/${product._id}`" class="ts-hot-inner">
              <div class="ts-hot-img-wrap">
                <img :src="smallCover(getProductImage(product))" alt="" />
                <div class="ts-hot-badge">HOT</div>
                <div class="ts-hot-overlay">
                  <button class="ts-btn-view">Xem chi tiết</button>
                </div>
              </div>
              <div class="ts-hot-info">
                <h6>{{ product.name }}</h6>
                <p class="ts-price">{{ product.price?.toLocaleString() }}₫</p>
                <p class="ts-sold">🔥 {{ product.sold || 0 }} đã bán</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         FLASH SALE
    ══════════════════════════════════════ -->
    <section class="ts-flash">
      <div class="ts-container">
        <div class="ts-flash-header">
          <div class="ts-flash-left">
            <div class="ts-flash-badge">⚡ FLASH SALE</div>
            <h2 class="ts-section-title">Ưu đãi <em>giới hạn</em></h2>
          </div>
          <div class="ts-countdown">
            <div class="ts-cd-block">
              <span class="ts-cd-val">{{ countdownTimer.hours }}</span>
              <span class="ts-cd-lbl">GIỜ</span>
            </div>
            <span class="ts-cd-sep">:</span>
            <div class="ts-cd-block">
              <span class="ts-cd-val">{{ countdownTimer.minutes }}</span>
              <span class="ts-cd-lbl">PHÚT</span>
            </div>
            <span class="ts-cd-sep">:</span>
            <div class="ts-cd-block">
              <span class="ts-cd-val">{{ countdownTimer.seconds }}</span>
              <span class="ts-cd-lbl">GIÂY</span>
            </div>
          </div>
        </div>

        <div class="ts-flash-grid">
          <div
            v-for="product in flashSaleProducts"
            :key="product._id"
            class="ts-flash-card"
          >
            <router-link :to="`/products/${product._id}`">
              <div class="ts-flash-img-wrap">
                <img :src="smallCover(getProductImage(product))" alt="" />
                <div class="ts-flash-discount">-{{ product.discount || 15 }}%</div>
              </div>
              <div class="ts-flash-info">
                <h6>{{ product.name }}</h6>
                <div class="ts-flash-prices">
                  <span class="ts-old-price">{{ (product.price * 1.15)?.toLocaleString() }}₫</span>
                  <span class="ts-new-price">{{ product.price?.toLocaleString() }}₫</span>
                </div>
                <button class="ts-btn-cart">Thêm vào giỏ 🛒</button>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         REVIEWS
    ══════════════════════════════════════ -->
    <section class="ts-reviews">
      <div class="ts-container">
        <div class="ts-section-header text-center">
          <h2 class="ts-section-title">⭐ Khách hàng <em>nói gì</em>?</h2>
          <p class="ts-section-sub">Phản hồi thật từ người mua hàng thật</p>
        </div>

        <div v-if="reviewsLoading" class="ts-loading">
          <div class="ts-spinner"></div>
        </div>

        <div v-else-if="latestReviews.length" class="ts-reviews-grid">
          <div
            v-for="review in latestReviews"
            :key="review._id"
            class="ts-review-card"
          >
            <div class="ts-review-top">
              <div class="ts-reviewer">
                <div class="ts-avatar">{{ review.userInfo?.name?.charAt(0)?.toUpperCase() || 'U' }}</div>
                <div>
                  <div class="ts-reviewer-name">{{ review.userInfo?.name || 'Người dùng' }}</div>
                  <div class="ts-reviewer-date">{{ formatDate(review.createdAt) }}</div>
                </div>
              </div>
              <div class="ts-stars">
                <span
                  v-for="s in 5" :key="s"
                  :class="['ts-star', { 'ts-star--on': s <= review.rating }]"
                >★</span>
              </div>
            </div>
            <p v-if="review.title" class="ts-review-title">{{ review.title }}</p>
            <p class="ts-review-body">{{ review.comment }}</p>
            <span v-if="review.productName" class="ts-review-product">{{ review.productName }}</span>
          </div>
        </div>

        <div v-else class="ts-empty">Chưa có đánh giá nào 🌟</div>

        <div class="text-center mt-5">
          <router-link to="/products" class="ts-btn ts-btn--outline">
            Mua & đánh giá ngay →
          </router-link>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════
         NEW ARRIVALS
    ══════════════════════════════════════ -->
    <section class="ts-arrivals">
      <div class="ts-container">
        <div class="ts-section-row mb-5">
          <div>
            <h2 class="ts-section-title">📱 Mới về <em>hôm nay</em></h2>
            <p class="ts-section-sub">Những phụ kiện vừa nhập kho</p>
          </div>
          <router-link to="/products" class="ts-btn ts-btn--primary ts-btn--sm">Xem tất cả</router-link>
        </div>
        <div class="ts-arrivals-grid">
          <div v-for="product in newArrivals" :key="product._id" class="ts-arrival-card">
            <router-link :to="`/products/${product._id}`">
              <div class="ts-arrival-img-wrap">
                <img :src="smallCover(getProductImage(product))" alt="" />
                <span class="ts-new-tag">NEW</span>
                <div class="ts-arrival-actions">
                  <button class="ts-icon-btn">❤️</button>
                  <button class="ts-icon-btn">🛒</button>
                </div>
              </div>
              <div class="ts-arrival-info">
                <h6>{{ product.name }}</h6>
                <div class="ts-rating">
                  <span class="ts-stars-sm">★★★★★</span>
                  <span class="ts-rating-count">({{ product.reviews || 0 }})</span>
                </div>
                <p class="ts-price">{{ product.price?.toLocaleString() }}₫</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import productService from "@/services/product.service";
import ReviewService from "@/services/review.service";
import mainVideo from "@/assets/video/Banner Chính.mp4";
import heroImage from "@/assets/img/Banner Hero.png";

import TaiNghe from "@/assets/img/Tai nghe.jpg";
import CuSac from "@/assets/img/Củ sạc.jpg";
import CapSac from "@/assets/img/Cáp sạc.jpg";
import KinhCuongLuc from "@/assets/img/Kính cường lực.jpg";
import PinDuPhong from "@/assets/img/Pin dự phòng.jpg";
import SacKhongDay from "@/assets/img/Sạc không dây.jpg";

const smallVideos = Array(12).fill(mainVideo);
const mainVideoRef = ref(null);
const allPlaying = ref(true);

const toggleAllVideos = () => {
  const videos = [];
  if (mainVideoRef.value) videos.push(mainVideoRef.value);
  document.querySelectorAll(".ts-small-vid video").forEach((v) => videos.push(v));
  if (allPlaying.value) videos.forEach((v) => v.pause());
  else videos.forEach((v) => v.play());
  allPlaying.value = !allPlaying.value;
};

const brands = [
  { name: "Tai Nghe", logo: TaiNghe },
  { name: "Củ sạc", logo: CuSac },
  { name: "Cáp sạc", logo: CapSac },
  { name: "Kính cường lực", logo: KinhCuongLuc },
  { name: "Pin dự phòng", logo: PinDuPhong },
  { name: "Sạc không dây", logo: SacKhongDay },
];

const hotProducts = ref([]);
const flashSaleProducts = ref([]);
const newArrivals = ref([]);
const latestReviews = ref([]);
const reviewsLoading = ref(false);
const countdownTimer = ref({ hours: 2, minutes: 30, seconds: 45 });
let countdownInterval = null;

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    let { hours, minutes, seconds } = countdownTimer.value;
    if (--seconds < 0) { seconds = 59; if (--minutes < 0) { minutes = 59; if (--hours < 0) { hours = 2; minutes = 30; seconds = 45; } } }
    countdownTimer.value = { hours, minutes, seconds };
  }, 1000);
};

async function loadLatestReviews(products = []) {
  reviewsLoading.value = true;
  try {
    const collected = [];
    await Promise.all(products.slice(0, 6).map(async (p) => {
      try {
        const res = await ReviewService.getByProduct(p._id, { page: 1, limit: 3 });
        (res.reviews || []).forEach((r) => { r.productName = p.name; collected.push(r); });
      } catch (_) {}
    }));
    latestReviews.value = collected
      .filter((r) => r.rating >= 3)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  } finally {
    reviewsLoading.value = false;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const getProductImage = (product) => {
  if (!product) return null;
  if (typeof product.image === "string") return product.image;
  if (typeof product.thumbnail === "string") return product.thumbnail;
  if (Array.isArray(product.images)) return product.images[0]?.secure_url || product.images[0]?.url || product.images[0];
  return null;
};

const smallCover = (url) => {
  if (!url) return "https://via.placeholder.com/300x300";
  if (url.includes("cloudinary")) return url.replace("/upload/", "/upload/c_fill,w_300,h_300,q_auto,f_auto/");
  return url;
};

onMounted(async () => {
  try {
    const res = await productService.getAll({ limit: 12, sortBy: "sold", sortOrder: "desc" });
    const products = (res.products || res).slice(0, 12);
    hotProducts.value = products.slice(0, 8);
    flashSaleProducts.value = products.slice(0, 4);
    newArrivals.value = products.slice(4, 12);
    await loadLatestReviews(products);
  } catch (err) { console.log(err); }
  startCountdown();
});

onUnmounted(() => { if (countdownInterval) clearInterval(countdownInterval); });
</script>

<style scoped>
/* ════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════ */
.ts-root {
  --ts-bg:        #050810;
  --ts-surface:   #0d1117;
  --ts-surface-2: #111827;
  --ts-border:    rgba(255,255,255,0.07);
  --ts-accent:    #00d4ff;
  --ts-accent-2:  #ff6b35;
  --ts-accent-3:  #a855f7;
  --ts-text:      #f1f5f9;
  --ts-text-dim:  #94a3b8;
  --ts-gold:      #fbbf24;
  --ts-green:     #10b981;
  --ts-red:       #ef4444;
  --ts-radius:    16px;
  --ts-radius-lg: 24px;
  --ts-glow:      0 0 40px rgba(0,212,255,0.15);

  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--ts-bg);
  color: var(--ts-text);
  overflow-x: hidden;
}

/* ── LAYOUT ── */
.ts-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}
.ts-section-header { margin-bottom: 48px; }
.ts-section-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--ts-text);
  margin: 0;
}
.ts-section-title em {
  font-style: normal;
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ts-section-sub { color: var(--ts-text-dim); margin-top: 8px; font-size: 1rem; }
.ts-section-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.ts-link-all {
  color: var(--ts-accent);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  font-size: 0.95rem;
  transition: opacity .2s;
}
.ts-link-all:hover { opacity: .7; }
.text-center { text-align: center; }
.mb-4 { margin-bottom: 24px; }
.mb-5 { margin-bottom: 40px; }
.mt-5 { margin-top: 40px; }

/* ── BUTTONS ── */
.ts-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 999px; font-weight: 700;
  font-size: 0.95rem; cursor: pointer; text-decoration: none;
  border: none; transition: all .25s;
}
.ts-btn--primary {
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3));
  color: #fff;
  box-shadow: 0 8px 24px rgba(0,212,255,0.3);
}
.ts-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,212,255,0.45); }
.ts-btn--ghost {
  background: rgba(255,255,255,0.06);
  color: var(--ts-text);
  border: 1px solid var(--ts-border);
  backdrop-filter: blur(8px);
}
.ts-btn--ghost:hover { background: rgba(255,255,255,0.1); }
.ts-btn--outline {
  background: transparent;
  color: var(--ts-accent);
  border: 1.5px solid var(--ts-accent);
}
.ts-btn--outline:hover { background: rgba(0,212,255,0.08); }
.ts-btn--sm { padding: 10px 20px; font-size: 0.875rem; }

/* ════════════════════════════════════════
   VIDEO FAB
════════════════════════════════════════ */
.ts-video-fab {
  position: fixed; bottom: 32px; left: 32px; z-index: 9999;
}
.ts-fab-btn {
  display: flex; align-items: center; gap: 10px;
  background: var(--ts-surface-2);
  border: 1px solid var(--ts-border);
  color: var(--ts-text); padding: 12px 20px;
  border-radius: 999px; cursor: pointer; font-weight: 600;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  transition: all .25s;
}
.ts-fab-btn:hover { transform: translateY(-3px); border-color: var(--ts-accent); }
.ts-fab-icon { font-size: 1.1rem; }
.ts-fab-label { font-size: 0.875rem; }

/* ════════════════════════════════════════
   HERO
════════════════════════════════════════ */
.ts-hero {
  min-height: 100vh;
  display: flex; align-items: center;
  background-size: cover; background-position: center;
  position: relative; overflow: hidden;
}
.ts-hero-overlay {
  position: absolute; inset: 0;
}
.ts-hero-overlay--dark { background: rgba(5,8,16,0.82); }
.ts-hero-overlay--gradient {
  background: linear-gradient(135deg,
    rgba(0,212,255,0.06) 0%,
    transparent 50%,
    rgba(168,85,247,0.06) 100%);
}
.ts-hero-noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: .5;
}
.ts-orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); pointer-events: none;
}
.ts-orb--1 {
  width: 500px; height: 500px;
  background: rgba(0,212,255,0.08);
  top: -100px; left: -150px;
  animation: drift1 8s ease-in-out infinite;
}
.ts-orb--2 {
  width: 400px; height: 400px;
  background: rgba(168,85,247,0.08);
  bottom: -80px; right: -100px;
  animation: drift2 10s ease-in-out infinite;
}
.ts-orb--3 {
  width: 300px; height: 300px;
  background: rgba(255,107,53,0.06);
  top: 40%; right: 20%;
  animation: drift1 12s ease-in-out infinite reverse;
}
@keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-30px)} }
@keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }

.ts-hero-content {
  position: relative; z-index: 2;
  width: 100%; max-width: 800px;
  margin: 0 auto; padding: 80px 24px;
  text-align: center;
}
.ts-hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(0,212,255,0.1);
  border: 1px solid rgba(0,212,255,0.3);
  color: var(--ts-accent); padding: 8px 20px;
  border-radius: 999px; font-size: 0.875rem; font-weight: 600;
  margin-bottom: 32px; letter-spacing: 0.05em;
}
.ts-badge-dot {
  width: 8px; height: 8px; background: var(--ts-accent);
  border-radius: 50%; animation: blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

.ts-hero-title {
  display: flex; flex-direction: column; gap: 4px;
  margin: 0 0 24px;
}
.ts-title-line { display: block; line-height: 1.05; }
.ts-title-line--dim {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  color: var(--ts-text-dim); font-weight: 400; letter-spacing: 0.3em;
  text-transform: uppercase;
}
.ts-title-line--main {
  font-size: clamp(3rem, 9vw, 7rem);
  font-weight: 900; color: var(--ts-text); letter-spacing: -0.03em;
}
.ts-title-line--accent {
  font-size: clamp(1.8rem, 5vw, 3.5rem);
  font-weight: 800; letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--ts-accent) 0%, var(--ts-accent-3) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.ts-hero-sub {
  color: var(--ts-text-dim); font-size: 1.1rem;
  margin-bottom: 40px; line-height: 1.8;
}
.ts-hero-actions {
  display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  margin-bottom: 56px;
}
.ts-hero-stats {
  display: flex; align-items: center; justify-content: center; gap: 24px;
}
.ts-stat { display: flex; flex-direction: column; gap: 2px; }
.ts-stat strong { font-size: 1.4rem; font-weight: 800; color: var(--ts-text); }
.ts-stat span { font-size: 0.78rem; color: var(--ts-text-dim); text-transform: uppercase; letter-spacing: 0.08em; }
.ts-stat-divider { width: 1px; height: 36px; background: var(--ts-border); }

.ts-scroll-hint {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  z-index: 2;
}
.ts-scroll-hint span { font-size: 0.75rem; color: var(--ts-text-dim); letter-spacing: 0.1em; text-transform: uppercase; }
.ts-scroll-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, var(--ts-accent), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}
@keyframes scrollPulse { 0%,100%{transform:scaleY(1);opacity:1} 50%{transform:scaleY(0.5);opacity:0.5} }

/* ════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════ */
.ts-cats {
  background: var(--ts-surface);
  border-top: 1px solid var(--ts-border);
  border-bottom: 1px solid var(--ts-border);
  padding: 48px 0;
}
.ts-cats-label {
  font-size: 0.7rem; letter-spacing: 0.2em;
  color: var(--ts-text-dim); margin-bottom: 24px; text-align: center;
}
.ts-cats-grid {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 32px;
}
.ts-cat-item {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  font-size: 0.85rem; color: var(--ts-text-dim); cursor: pointer;
  transition: color .2s;
}
.ts-cat-item:hover { color: var(--ts-text); }
.ts-cat-img-wrap {
  position: relative;
  width: 72px; height: 72px; border-radius: 50%;
  overflow: hidden; border: 2px solid var(--ts-border);
  transition: border-color .2s;
}
.ts-cat-item:hover .ts-cat-img-wrap { border-color: var(--ts-accent); }
.ts-cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.ts-cat-glow {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%);
  opacity: 0; transition: opacity .2s;
}
.ts-cat-item:hover .ts-cat-glow { opacity: 1; }

/* ════════════════════════════════════════
   VIDEO MAIN
════════════════════════════════════════ */
.ts-video-main {
  padding: 96px 0;
  background: var(--ts-bg);
}
.ts-section-header.text-center { text-align: center; }
.ts-video-frame {
  position: relative; border-radius: var(--ts-radius-lg);
  overflow: hidden; margin-top: 40px;
}
.ts-video-border-glow {
  position: absolute; inset: -2px; border-radius: inherit; z-index: 0;
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3), var(--ts-accent-2));
  filter: blur(1px);
}
.ts-video-el {
  position: relative; z-index: 1;
  width: 100%; max-height: 600px; object-fit: cover;
  display: block; border-radius: var(--ts-radius-lg);
}
.ts-video-corner {
  position: absolute; z-index: 2; width: 24px; height: 24px;
  border-color: var(--ts-accent); border-style: solid;
}
.ts-video-corner--tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
.ts-video-corner--tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
.ts-video-corner--bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
.ts-video-corner--br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }

/* ════════════════════════════════════════
   SMALL VIDEO GRID
════════════════════════════════════════ */
.ts-video-grid-section {
  padding: 64px 0;
  background: var(--ts-surface);
}
.ts-small-video-grid {
  display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
}
.ts-small-vid {
  position: relative; border-radius: 12px; overflow: hidden;
  border: 1px solid var(--ts-border);
}
.ts-small-vid video {
  width: 180px; height: 100px; object-fit: cover; display: block;
  transition: transform .3s;
}
.ts-small-vid:hover video { transform: scale(1.07); }
.ts-small-vid-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(5,8,16,0.5), transparent);
  pointer-events: none;
}

/* ════════════════════════════════════════
   HOT PRODUCTS
════════════════════════════════════════ */
.ts-hot-section {
  padding: 96px 0;
  background: linear-gradient(160deg, #08101a, var(--ts-bg));
}
.ts-hot-scroll {
  display: flex; gap: 20px; overflow-x: auto;
  padding-bottom: 16px; scroll-snap-type: x mandatory;
  scrollbar-width: thin; scrollbar-color: var(--ts-border) transparent;
}
.ts-hot-card {
  flex: 0 0 220px; scroll-snap-align: start;
}
.ts-hot-inner {
  display: block; text-decoration: none; color: var(--ts-text);
  background: var(--ts-surface);
  border: 1px solid var(--ts-border);
  border-radius: var(--ts-radius-lg); overflow: hidden;
  transition: all .3s;
}
.ts-hot-inner:hover {
  border-color: rgba(0,212,255,0.4);
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), var(--ts-glow);
}
.ts-hot-img-wrap { position: relative; overflow: hidden; }
.ts-hot-img-wrap img { width: 100%; height: 250px; object-fit: cover; transition: transform .4s; }
.ts-hot-inner:hover .ts-hot-img-wrap img { transform: scale(1.08); }
.ts-hot-badge {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, var(--ts-accent-2), #dc2626);
  color: #fff; padding: 4px 12px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em;
}
.ts-hot-overlay {
  position: absolute; inset: 0;
  background: rgba(5,8,16,0.6);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .3s;
}
.ts-hot-inner:hover .ts-hot-overlay { opacity: 1; }
.ts-btn-view {
  background: var(--ts-accent); color: var(--ts-bg);
  border: none; padding: 10px 20px; border-radius: 999px;
  font-weight: 700; cursor: pointer; font-size: 0.85rem;
}
.ts-hot-info { padding: 16px; }
.ts-hot-info h6 { font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; line-height: 1.4; }
.ts-price { color: var(--ts-gold); font-weight: 700; margin: 0; }
.ts-sold { font-size: 0.78rem; color: var(--ts-text-dim); margin-top: 4px; }

/* ════════════════════════════════════════
   FLASH SALE
════════════════════════════════════════ */
.ts-flash {
  padding: 96px 0;
  background: var(--ts-surface);
  border-top: 1px solid var(--ts-border);
}
.ts-flash-header {
  display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 24px;
  margin-bottom: 48px;
}
.ts-flash-left { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.ts-flash-badge {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff; padding: 10px 18px; border-radius: 999px;
  font-weight: 800; font-size: 0.875rem;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
.ts-countdown {
  display: flex; align-items: center; gap: 6px;
  background: var(--ts-surface-2); padding: 16px 24px;
  border-radius: 999px; border: 1px solid var(--ts-border);
}
.ts-cd-block { display: flex; flex-direction: column; align-items: center; min-width: 48px; }
.ts-cd-val { font-size: 1.5rem; font-weight: 800; color: var(--ts-accent); font-variant-numeric: tabular-nums; }
.ts-cd-lbl { font-size: 0.65rem; color: var(--ts-text-dim); letter-spacing: 0.1em; margin-top: 2px; }
.ts-cd-sep { font-size: 1.4rem; color: var(--ts-accent); font-weight: 700; }

.ts-flash-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 20px;
}
.ts-flash-card {
  background: var(--ts-bg); border: 1px solid var(--ts-border);
  border-radius: var(--ts-radius-lg); overflow: hidden;
  transition: all .3s;
}
.ts-flash-card:hover {
  border-color: rgba(251,191,36,0.5);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4);
}
.ts-flash-card a { display: block; text-decoration: none; color: var(--ts-text); }
.ts-flash-img-wrap { position: relative; overflow: hidden; }
.ts-flash-img-wrap img { width: 100%; height: 220px; object-fit: cover; transition: transform .4s; }
.ts-flash-card:hover .ts-flash-img-wrap img { transform: scale(1.1); }
.ts-flash-discount {
  position: absolute; top: 10px; right: 10px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff; padding: 6px 12px; border-radius: 8px;
  font-weight: 800; font-size: 0.85rem;
}
.ts-flash-info { padding: 16px; }
.ts-flash-info h6 { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }
.ts-flash-prices { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.ts-old-price { color: var(--ts-text-dim); font-size: 0.85rem; text-decoration: line-through; }
.ts-new-price { color: #ef4444; font-weight: 700; font-size: 1.1rem; }
.ts-btn-cart {
  width: 100%; padding: 10px; border: none;
  background: linear-gradient(135deg, var(--ts-gold), #f59e0b);
  color: #000; border-radius: 10px; font-weight: 700;
  cursor: pointer; font-size: 0.875rem; transition: all .25s;
}
.ts-btn-cart:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(251,191,36,0.35); }

/* ════════════════════════════════════════
   REVIEWS
════════════════════════════════════════ */
.ts-reviews {
  padding: 96px 0;
  background: var(--ts-bg);
}
.ts-loading {
  display: flex; justify-content: center; padding: 60px 0;
}
.ts-spinner {
  width: 40px; height: 40px; border: 3px solid var(--ts-border);
  border-top-color: var(--ts-accent); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.ts-reviews-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 20px;
}
.ts-review-card {
  background: var(--ts-surface); border: 1px solid var(--ts-border);
  border-radius: var(--ts-radius-lg); padding: 24px;
  transition: all .3s;
}
.ts-review-card:hover {
  border-color: rgba(0,212,255,0.25);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.3);
}
.ts-review-top {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 16px;
}
.ts-reviewer { display: flex; gap: 12px; align-items: center; }
.ts-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3));
  color: #fff; font-weight: 800; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ts-reviewer-name { font-weight: 600; font-size: 0.9rem; }
.ts-reviewer-date { font-size: 0.78rem; color: var(--ts-text-dim); margin-top: 2px; }
.ts-stars { display: flex; gap: 2px; }
.ts-star { color: rgba(255,255,255,0.15); font-size: 1.1rem; }
.ts-star--on { color: var(--ts-gold); }
.ts-review-title { font-weight: 700; margin-bottom: 8px; font-size: 0.95rem; }
.ts-review-body { color: var(--ts-text-dim); line-height: 1.65; font-size: 0.9rem; margin-bottom: 12px; }
.ts-review-product {
  display: inline-block;
  background: rgba(0,212,255,0.1); color: var(--ts-accent);
  border: 1px solid rgba(0,212,255,0.2);
  padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 500;
}
.ts-empty { text-align: center; color: var(--ts-text-dim); padding: 60px 0; font-size: 1rem; }

/* ════════════════════════════════════════
   NEW ARRIVALS
════════════════════════════════════════ */
.ts-arrivals {
  padding: 96px 0;
  background: var(--ts-surface);
  border-top: 1px solid var(--ts-border);
}
.ts-arrivals-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 20px;
}
.ts-arrival-card {
  background: var(--ts-bg); border: 1px solid var(--ts-border);
  border-radius: var(--ts-radius-lg); overflow: hidden;
  transition: all .3s;
}
.ts-arrival-card:hover {
  border-color: rgba(16,185,129,0.4);
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.3);
}
.ts-arrival-card a { display: block; text-decoration: none; color: var(--ts-text); }
.ts-arrival-img-wrap { position: relative; overflow: hidden; }
.ts-arrival-img-wrap img { width: 100%; height: 200px; object-fit: cover; transition: transform .4s; }
.ts-arrival-card:hover .ts-arrival-img-wrap img { transform: scale(1.12) rotate(1deg); }
.ts-new-tag {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, var(--ts-green), #059669);
  color: #fff; padding: 4px 12px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em;
}
.ts-arrival-actions {
  position: absolute; bottom: 10px; right: 10px;
  display: flex; gap: 6px;
  opacity: 0; transform: translateY(8px); transition: all .3s;
}
.ts-arrival-card:hover .ts-arrival-actions { opacity: 1; transform: translateY(0); }
.ts-icon-btn {
  width: 36px; height: 36px;
  background: rgba(13,17,23,0.85); backdrop-filter: blur(8px);
  border: 1px solid var(--ts-border); border-radius: 50%;
  cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
  transition: border-color .2s;
}
.ts-icon-btn:hover { border-color: var(--ts-accent); }
.ts-arrival-info { padding: 16px; }
.ts-arrival-info h6 { font-size: 0.875rem; font-weight: 600; margin-bottom: 6px; line-height: 1.4; }
.ts-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.ts-stars-sm { color: var(--ts-gold); font-size: 0.85rem; }
.ts-rating-count { font-size: 0.78rem; color: var(--ts-text-dim); }

/* ════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════ */
@media (max-width: 768px) {
  .ts-hero-content { padding: 100px 24px 60px; }
  .ts-flash-header { flex-direction: column; align-items: flex-start; }
  .ts-section-row { flex-direction: column; align-items: flex-start; }
  .ts-hero-stats { gap: 16px; }
  .ts-fab-label { display: none; }
  .ts-scroll-hint { display: none; }
}
</style>