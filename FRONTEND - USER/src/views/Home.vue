<template>
  <div class="min-h-screen ts-root">

    <!-- ══════════════════════════════════════
         HERO CAROUSEL
    ══════════════════════════════════════ -->
    <section class="ts-hero" @mouseenter="pauseHero" @mouseleave="resumeHero">
      <div class="ts-hero-track" :style="{ transform: `translateX(-${heroIndex * 100}%)` }">
        <div v-for="(slide, i) in heroSlides" :key="i" class="ts-hero-slide">
          <video
            v-if="slide.type === 'video'"
            :src="slide.src"
            autoplay muted loop playsinline
            class="ts-hero-media"
          ></video>
          <img v-else-if="slide.type === 'image'" :src="slide.src" class="ts-hero-media" alt="" />
          <div v-else class="ts-hero-media ts-hero-media--promo"></div>

          <div class="ts-hero-overlay"></div>

          <div class="ts-hero-content">
            <div class="ts-hero-badge">
              <span class="ts-badge-dot"></span>{{ slide.badge }}
            </div>
            <h1 class="ts-hero-title">
              <span v-for="(line, li) in slide.titleLines" :key="li" :class="['ts-title-line', line.cls]">{{ line.text }}</span>
            </h1>
            <p class="ts-hero-sub">{{ slide.sub }}</p>
            <div class="ts-hero-actions">
              <router-link to="/products" class="ts-btn ts-btn--primary">
                <span>{{ slide.cta }}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <button class="ts-hero-arrow ts-hero-arrow--prev" @click="prevHero" aria-label="Trước">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="ts-hero-arrow ts-hero-arrow--next" @click="nextHero" aria-label="Sau">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div class="ts-hero-dots">
        <button
          v-for="(s, i) in heroSlides" :key="i"
          :class="['ts-hero-dot', { 'ts-hero-dot--on': i === heroIndex }]"
          @click="goHero(i)"
          :aria-label="`Slide ${i + 1}`"
        ></button>
      </div>

      <div class="ts-hero-stats">
        <div class="ts-stat"><strong>20+</strong><span>Sản phẩm</span></div>
        <div class="ts-stat-divider"></div>
        <div class="ts-stat"><strong>20+</strong><span>Khách hàng</span></div>
        <div class="ts-stat-divider"></div>
        <div class="ts-stat"><strong>4.9★</strong><span>Đánh giá</span></div>
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
         HOT PRODUCTS CAROUSEL
    ══════════════════════════════════════ -->
    <section class="ts-hot-section">
      <div class="ts-container">
        <div class="ts-section-row">
          <div>
            <h2 class="ts-section-title">🔥 <em>Bán chạy</em> nhất</h2>
            <p class="ts-section-sub">Những sản phẩm được yêu thích nhất</p>
          </div>
          <div class="ts-carousel-nav">
            <button class="ts-nav-btn" @click="scrollHot(-1)" aria-label="Trước">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="ts-nav-btn" @click="scrollHot(1)" aria-label="Sau">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <router-link to="/products" class="ts-link-all">Xem tất cả →</router-link>
          </div>
        </div>

        <div class="ts-hot-scroll" ref="hotScrollRef">
          <div v-for="product in hotProducts" :key="product._id" class="ts-hot-card">
            <router-link :to="`/products/${product._id}`" class="ts-hot-inner">
              <div class="ts-hot-img-wrap">
                <img :src="smallCover(getProductImage(product))" alt="" />
                <div class="ts-hot-badge">HOT</div>
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
         REVIEWS CAROUSEL
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

        <div v-else-if="latestReviews.length" class="ts-review-carousel" @mouseenter="stopReviewAutoplay" @mouseleave="startReviewAutoplay">
          <div class="ts-review-track" :style="{ transform: `translateX(-${reviewIndex * 100}%)` }">
            <div v-for="review in latestReviews" :key="review._id" class="ts-review-slide">
              <div class="ts-review-card">
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
          </div>

          <button v-if="latestReviews.length > 1" class="ts-review-arrow ts-review-arrow--prev" @click="prevReview" aria-label="Trước">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button v-if="latestReviews.length > 1" class="ts-review-arrow ts-review-arrow--next" @click="nextReview" aria-label="Sau">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <div v-if="latestReviews.length > 1" class="ts-review-dots">
            <button
              v-for="(r, i) in latestReviews" :key="i"
              :class="['ts-review-dot', { 'ts-review-dot--on': i === reviewIndex }]"
              @click="goReview(i)"
              :aria-label="`Đánh giá ${i + 1}`"
            ></button>
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

/* ── HERO CAROUSEL ── */
const heroSlides = [
  {
    type: "video",
    src: mainVideo,
    badge: "Bộ sưu tập 2026",
    titleLines: [
      { text: "Phụ Kiện", cls: "ts-title-line--main" },
      { text: "Đẳng Cấp Mới", cls: "ts-title-line--accent" },
    ],
    sub: "Khám phá xu hướng phụ kiện smartphone mới nhất",
    cta: "Khám phá ngay",
  },
  {
    type: "image",
    src: heroImage,
    badge: "NhutAnhStore · Hàng chính hãng",
    titleLines: [
      { text: "NHUTANH", cls: "ts-title-line--dim" },
      { text: "STORE", cls: "ts-title-line--main" },
    ],
    sub: "Ốp lưng · Cáp sạc · Tai nghe · Sạc nhanh · Pin dự phòng",
    cta: "Mua ngay",
  },
  {
    type: "promo",
    badge: "⚡ Flash Sale hôm nay",
    titleLines: [
      { text: "Giảm đến", cls: "ts-title-line--dim" },
      { text: "50%", cls: "ts-title-line--main ts-title-line--fire" },
    ],
    sub: "Ưu đãi giới hạn thời gian, số lượng có hạn",
    cta: "Săn sale ngay",
  },
];

const heroIndex = ref(0);
let heroTimer = null;
function startHero() {
  stopHeroTimer();
  heroTimer = setInterval(() => nextHero(), 6000);
}
function stopHeroTimer() {
  if (heroTimer) clearInterval(heroTimer);
}
function nextHero() { heroIndex.value = (heroIndex.value + 1) % heroSlides.length; }
function prevHero() { heroIndex.value = (heroIndex.value - 1 + heroSlides.length) % heroSlides.length; }
function goHero(i) { heroIndex.value = i; }
function pauseHero() { stopHeroTimer(); }
function resumeHero() { startHero(); }

/* ── CATEGORIES ── */
const brands = [
  { name: "Tai Nghe", logo: TaiNghe },
  { name: "Củ sạc", logo: CuSac },
  { name: "Cáp sạc", logo: CapSac },
  { name: "Kính cường lực", logo: KinhCuongLuc },
  { name: "Pin dự phòng", logo: PinDuPhong },
  { name: "Sạc không dây", logo: SacKhongDay },
];

/* ── HOT PRODUCTS ── */
const hotProducts = ref([]);
const hotScrollRef = ref(null);
function scrollHot(dir) {
  const el = hotScrollRef.value;
  if (!el) return;
  el.scrollBy({ left: dir * 248, behavior: "smooth" });
}

/* ── FLASH SALE ── */
const flashSaleProducts = ref([]);
const countdownTimer = ref({ hours: 2, minutes: 30, seconds: 45 });
let countdownInterval = null;
const startCountdown = () => {
  countdownInterval = setInterval(() => {
    let { hours, minutes, seconds } = countdownTimer.value;
    if (--seconds < 0) { seconds = 59; if (--minutes < 0) { minutes = 59; if (--hours < 0) { hours = 2; minutes = 30; seconds = 45; } } }
    countdownTimer.value = { hours, minutes, seconds };
  }, 1000);
};

/* ── NEW ARRIVALS ── */
const newArrivals = ref([]);

/* ── REVIEWS CAROUSEL ── */
const latestReviews = ref([]);
const reviewsLoading = ref(false);
const reviewIndex = ref(0);
let reviewTimer = null;
function startReviewAutoplay() {
  stopReviewAutoplay();
  if (latestReviews.value.length > 1) {
    reviewTimer = setInterval(() => nextReview(), 5000);
  }
}
function stopReviewAutoplay() { if (reviewTimer) clearInterval(reviewTimer); }
function nextReview() { reviewIndex.value = (reviewIndex.value + 1) % latestReviews.value.length; }
function prevReview() { reviewIndex.value = (reviewIndex.value - 1 + latestReviews.value.length) % latestReviews.value.length; }
function goReview(i) { reviewIndex.value = i; }

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
    startReviewAutoplay();
  } finally {
    reviewsLoading.value = false;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ── SHARED HELPERS ── */
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
  startHero();
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  stopHeroTimer();
  stopReviewAutoplay();
});
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
.ts-container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.ts-section-header { margin-bottom: 40px; }
.ts-section-title {
  font-size: clamp(1.7rem, 3.4vw, 2.5rem);
  font-weight: 800; letter-spacing: -0.02em; line-height: 1.15;
  color: var(--ts-text); margin: 0;
}
.ts-section-title em {
  font-style: normal;
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.ts-section-sub { color: var(--ts-text-dim); margin-top: 8px; font-size: 0.95rem; }
.ts-section-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 32px; }
.ts-link-all { color: var(--ts-accent); font-weight: 600; text-decoration: none; white-space: nowrap; font-size: 0.9rem; transition: opacity .2s; }
.ts-link-all:hover { opacity: .7; }
.text-center { text-align: center; }
.mb-5 { margin-bottom: 32px; }
.mt-5 { margin-top: 32px; }

/* ── BUTTONS ── */
.ts-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 999px; font-weight: 700;
  font-size: 0.95rem; cursor: pointer; text-decoration: none;
  border: none; transition: all .25s;
}
.ts-btn--primary {
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3));
  color: #fff; box-shadow: 0 8px 24px rgba(0,212,255,0.3);
}
.ts-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,212,255,0.45); }
.ts-btn--outline { background: transparent; color: var(--ts-accent); border: 1.5px solid var(--ts-accent); }
.ts-btn--outline:hover { background: rgba(0,212,255,0.08); }
.ts-btn--sm { padding: 10px 20px; font-size: 0.875rem; }

/* ════════════════════════════════════════
   HERO CAROUSEL
════════════════════════════════════════ */
.ts-hero {
  position: relative;
  height: 92vh; min-height: 560px;
  overflow: hidden;
  background: var(--ts-bg);
}
.ts-hero-track {
  display: flex; height: 100%;
  transition: transform .7s cubic-bezier(.65,0,.35,1);
}
.ts-hero-slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
}
.ts-hero-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ts-hero-media--promo {
  background:
    radial-gradient(circle at 20% 20%, rgba(255,107,53,0.25), transparent 55%),
    radial-gradient(circle at 80% 70%, rgba(168,85,247,0.22), transparent 55%),
    var(--ts-bg);
}
.ts-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(5,8,16,0.55) 0%, rgba(5,8,16,0.78) 60%, rgba(5,8,16,0.92) 100%);
}
.ts-hero-content {
  position: absolute; inset: 0; z-index: 2;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; max-width: 760px; margin: 0 auto; padding: 24px;
}
.ts-hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3);
  color: var(--ts-accent); padding: 8px 20px; border-radius: 999px;
  font-size: 0.85rem; font-weight: 600; margin-bottom: 28px; letter-spacing: 0.04em;
}
.ts-badge-dot { width: 8px; height: 8px; background: var(--ts-accent); border-radius: 50%; animation: blink 2s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

.ts-hero-title { display: flex; flex-direction: column; gap: 2px; margin: 0 0 20px; }
.ts-title-line { display: block; line-height: 1.05; }
.ts-title-line--dim { font-size: clamp(1.3rem, 3.2vw, 1.9rem); color: var(--ts-text-dim); font-weight: 400; letter-spacing: 0.25em; text-transform: uppercase; }
.ts-title-line--main { font-size: clamp(2.6rem, 7.5vw, 5.5rem); font-weight: 900; color: var(--ts-text); letter-spacing: -0.03em; }
.ts-title-line--accent {
  font-size: clamp(1.6rem, 4.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--ts-accent) 0%, var(--ts-accent-3) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.ts-title-line--fire {
  background: linear-gradient(135deg, var(--ts-gold), var(--ts-accent-2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.ts-hero-sub { color: var(--ts-text-dim); font-size: 1.05rem; margin-bottom: 32px; line-height: 1.7; }
.ts-hero-actions { display: flex; gap: 16px; justify-content: center; }

.ts-hero-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 46px; height: 46px; border-radius: 50%; z-index: 3;
  background: rgba(13,17,23,0.55); border: 1px solid var(--ts-border);
  color: var(--ts-text); display: flex; align-items: center; justify-content: center;
  cursor: pointer; backdrop-filter: blur(8px); transition: all .2s;
}
.ts-hero-arrow:hover { border-color: var(--ts-accent); background: rgba(13,17,23,0.8); }
.ts-hero-arrow--prev { left: 20px; }
.ts-hero-arrow--next { right: 20px; }

.ts-hero-dots {
  position: absolute; bottom: 116px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 3;
}
.ts-hero-dot { width: 8px; height: 8px; border-radius: 999px; border: none; background: rgba(255,255,255,0.25); cursor: pointer; transition: all .25s; }
.ts-hero-dot--on { width: 24px; background: var(--ts-accent); }

.ts-hero-stats {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; justify-content: center; gap: 24px; z-index: 3;
}
.ts-stat { display: flex; flex-direction: column; gap: 2px; align-items: center; }
.ts-stat strong { font-size: 1.3rem; font-weight: 800; color: var(--ts-text); }
.ts-stat span { font-size: 0.72rem; color: var(--ts-text-dim); text-transform: uppercase; letter-spacing: 0.08em; }
.ts-stat-divider { width: 1px; height: 32px; background: var(--ts-border); }

/* ════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════ */
.ts-cats { background: var(--ts-surface); border-bottom: 1px solid var(--ts-border); padding: 44px 0; }
.ts-cats-label { font-size: 0.7rem; letter-spacing: 0.2em; color: var(--ts-text-dim); margin-bottom: 22px; text-align: center; }
.ts-cats-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; }
.ts-cat-item { display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--ts-text-dim); cursor: pointer; transition: color .2s; }
.ts-cat-item:hover { color: var(--ts-text); }
.ts-cat-img-wrap { position: relative; width: 68px; height: 68px; border-radius: 50%; overflow: hidden; border: 2px solid var(--ts-border); transition: border-color .2s; }
.ts-cat-item:hover .ts-cat-img-wrap { border-color: var(--ts-accent); }
.ts-cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.ts-cat-glow { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%); opacity: 0; transition: opacity .2s; }
.ts-cat-item:hover .ts-cat-glow { opacity: 1; }

/* ════════════════════════════════════════
   HOT PRODUCTS CAROUSEL
════════════════════════════════════════ */
.ts-hot-section { padding: 88px 0; background: var(--ts-bg); }
.ts-carousel-nav { display: flex; align-items: center; gap: 10px; }
.ts-nav-btn {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--ts-surface-2); border: 1px solid var(--ts-border);
  color: var(--ts-text); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.ts-nav-btn:hover { border-color: var(--ts-accent); color: var(--ts-accent); }

.ts-hot-scroll {
  display: flex; gap: 18px; overflow-x: auto; scroll-behavior: smooth;
  padding-bottom: 10px; scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.ts-hot-scroll::-webkit-scrollbar { display: none; }
.ts-hot-card { flex: 0 0 220px; scroll-snap-align: start; }
.ts-hot-inner {
  display: block; text-decoration: none; color: var(--ts-text);
  background: var(--ts-surface); border: 1px solid var(--ts-border);
  border-radius: var(--ts-radius-lg); overflow: hidden; transition: all .3s;
}
.ts-hot-inner:hover { border-color: rgba(0,212,255,0.4); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4), var(--ts-glow); }
.ts-hot-img-wrap { position: relative; overflow: hidden; }
.ts-hot-img-wrap img { width: 100%; height: 220px; object-fit: cover; transition: transform .4s; }
.ts-hot-inner:hover .ts-hot-img-wrap img { transform: scale(1.06); }
.ts-hot-badge {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, var(--ts-accent-2), #dc2626);
  color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em;
}
.ts-hot-info { padding: 16px; }
.ts-hot-info h6 { font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; line-height: 1.4; }
.ts-price { color: var(--ts-gold); font-weight: 700; margin: 0; }
.ts-sold { font-size: 0.78rem; color: var(--ts-text-dim); margin-top: 4px; }

/* ════════════════════════════════════════
   FLASH SALE
════════════════════════════════════════ */
.ts-flash { padding: 88px 0; background: var(--ts-surface); border-top: 1px solid var(--ts-border); }
.ts-flash-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; margin-bottom: 40px; }
.ts-flash-left { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.ts-flash-badge { background: linear-gradient(135deg, #ef4444, #f97316); color: #fff; padding: 10px 18px; border-radius: 999px; font-weight: 800; font-size: 0.85rem; }
.ts-countdown { display: flex; align-items: center; gap: 6px; background: var(--ts-surface-2); padding: 14px 22px; border-radius: 999px; border: 1px solid var(--ts-border); }
.ts-cd-block { display: flex; flex-direction: column; align-items: center; min-width: 44px; }
.ts-cd-val { font-size: 1.4rem; font-weight: 800; color: var(--ts-accent); font-variant-numeric: tabular-nums; }
.ts-cd-lbl { font-size: 0.62rem; color: var(--ts-text-dim); letter-spacing: 0.1em; margin-top: 2px; }
.ts-cd-sep { font-size: 1.3rem; color: var(--ts-accent); font-weight: 700; }

.ts-flash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px,1fr)); gap: 18px; }
.ts-flash-card { background: var(--ts-bg); border: 1px solid var(--ts-border); border-radius: var(--ts-radius-lg); overflow: hidden; transition: all .3s; }
.ts-flash-card:hover { border-color: rgba(251,191,36,0.5); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
.ts-flash-card a { display: block; text-decoration: none; color: var(--ts-text); }
.ts-flash-img-wrap { position: relative; overflow: hidden; }
.ts-flash-img-wrap img { width: 100%; height: 200px; object-fit: cover; transition: transform .4s; }
.ts-flash-card:hover .ts-flash-img-wrap img { transform: scale(1.08); }
.ts-flash-discount { position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #ef4444, #f97316); color: #fff; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 0.82rem; }
.ts-flash-info { padding: 16px; }
.ts-flash-info h6 { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }
.ts-flash-prices { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.ts-old-price { color: var(--ts-text-dim); font-size: 0.82rem; text-decoration: line-through; }
.ts-new-price { color: #ef4444; font-weight: 700; font-size: 1.05rem; }
.ts-btn-cart { width: 100%; padding: 10px; border: none; background: linear-gradient(135deg, var(--ts-gold), #f59e0b); color: #000; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: all .25s; }
.ts-btn-cart:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(251,191,36,0.35); }

/* ════════════════════════════════════════
   REVIEWS CAROUSEL
════════════════════════════════════════ */
.ts-reviews { padding: 88px 0; background: var(--ts-bg); }
.ts-loading { display: flex; justify-content: center; padding: 60px 0; }
.ts-spinner { width: 36px; height: 36px; border: 3px solid var(--ts-border); border-top-color: var(--ts-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.ts-review-carousel { position: relative; overflow: hidden; max-width: 640px; margin: 0 auto; }
.ts-review-track { display: flex; transition: transform .5s ease; }
.ts-review-slide { flex: 0 0 100%; }
.ts-review-card { background: var(--ts-surface); border: 1px solid var(--ts-border); border-radius: var(--ts-radius-lg); padding: 32px; }
.ts-review-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.ts-reviewer { display: flex; gap: 12px; align-items: center; }
.ts-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3)); color: #fff; font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ts-reviewer-name { font-weight: 600; font-size: 0.9rem; }
.ts-reviewer-date { font-size: 0.78rem; color: var(--ts-text-dim); margin-top: 2px; }
.ts-stars { display: flex; gap: 2px; }
.ts-star { color: rgba(255,255,255,0.15); font-size: 1.05rem; }
.ts-star--on { color: var(--ts-gold); }
.ts-review-title { font-weight: 700; margin-bottom: 8px; font-size: 1rem; }
.ts-review-body { color: var(--ts-text-dim); line-height: 1.7; font-size: 0.92rem; margin-bottom: 14px; min-height: 3.4em; }
.ts-review-product { display: inline-block; background: rgba(0,212,255,0.1); color: var(--ts-accent); border: 1px solid rgba(0,212,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 500; }

.ts-review-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--ts-surface-2); border: 1px solid var(--ts-border);
  color: var(--ts-text); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.ts-review-arrow:hover { border-color: var(--ts-accent); color: var(--ts-accent); }
.ts-review-arrow--prev { left: -52px; }
.ts-review-arrow--next { right: -52px; }
.ts-review-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
.ts-review-dot { width: 7px; height: 7px; border-radius: 999px; border: none; background: rgba(255,255,255,0.2); cursor: pointer; transition: all .25s; }
.ts-review-dot--on { width: 20px; background: var(--ts-accent); }
.ts-empty { text-align: center; color: var(--ts-text-dim); padding: 60px 0; font-size: 1rem; }

/* ════════════════════════════════════════
   NEW ARRIVALS
════════════════════════════════════════ */
.ts-arrivals { padding: 88px 0; background: var(--ts-surface); border-top: 1px solid var(--ts-border); }
.ts-arrivals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 18px; }
.ts-arrival-card { background: var(--ts-bg); border: 1px solid var(--ts-border); border-radius: var(--ts-radius-lg); overflow: hidden; transition: all .3s; }
.ts-arrival-card:hover { border-color: rgba(16,185,129,0.4); transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
.ts-arrival-card a { display: block; text-decoration: none; color: var(--ts-text); }
.ts-arrival-img-wrap { position: relative; overflow: hidden; }
.ts-arrival-img-wrap img { width: 100%; height: 190px; object-fit: cover; transition: transform .4s; }
.ts-arrival-card:hover .ts-arrival-img-wrap img { transform: scale(1.1); }
.ts-new-tag { position: absolute; top: 10px; left: 10px; background: linear-gradient(135deg, var(--ts-green), #059669); color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; }
.ts-arrival-actions { position: absolute; bottom: 10px; right: 10px; display: flex; gap: 6px; opacity: 0; transform: translateY(8px); transition: all .3s; }
.ts-arrival-card:hover .ts-arrival-actions { opacity: 1; transform: translateY(0); }
.ts-icon-btn { width: 34px; height: 34px; background: rgba(13,17,23,0.85); backdrop-filter: blur(8px); border: 1px solid var(--ts-border); border-radius: 50%; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: border-color .2s; }
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
  .ts-hero { height: 100vh; }
  .ts-hero-content { padding: 20px; }
  .ts-hero-arrow { display: none; }
  .ts-hero-dots { bottom: 130px; }
  .ts-hero-stats { gap: 16px; flex-wrap: wrap; padding: 0 16px; }
  .ts-flash-header { flex-direction: column; align-items: flex-start; }
  .ts-section-row { flex-direction: column; align-items: flex-start; }
  .ts-review-arrow { display: none; }
}
</style>