<template>
  <div class="ts-root">

    <!-- ═══════════ FLOATING VIDEO CONTROL ═══════════ -->
    <div class="ts-video-fab">
      <button class="ts-fab-btn" @click="toggleAllVideos">
        <span class="ts-fab-icon">{{ allPlaying ? '⏸' : '▶' }}</span>
        <span class="ts-fab-label">{{ allPlaying ? 'Dừng video' : 'Phát video' }}</span>
      </button>
    </div>

    <!-- ═══════════ HERO ═══════════ -->
    <section class="ts-hero" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="ts-hero-overlay ts-hero-overlay--dark"></div>
      <div class="ts-hero-overlay ts-hero-overlay--gradient"></div>
      <div class="ts-hero-noise"></div>

      <div class="ts-orb ts-orb--1"></div>
      <div class="ts-orb ts-orb--2"></div>
      <div class="ts-orb ts-orb--3"></div>

      <!-- ADMIN BADGE -->
      <div class="ts-admin-badge-wrap">
        <div class="ts-admin-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ts-admin-badge-icon">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          ADMIN PANEL · NhutAnhStore
        </div>
      </div>

      <div class="ts-hero-content">
        <div class="ts-hero-badge">
          <span class="ts-badge-dot"></span>
          Quản trị hệ thống · 2026
        </div>

        <h1 class="ts-hero-title">
          <span class="ts-title-line ts-title-line--dim">NhutAnhStore</span>
          <span class="ts-title-line ts-title-line--main">Admin</span>
          <span class="ts-title-line ts-title-line--accent">Tổng Quan</span>
        </h1>

        <p class="ts-hero-sub">
          Quản lý sản phẩm · Đơn hàng · Khách hàng · Doanh thu
        </p>

        <div class="ts-hero-actions">
          <router-link to="/products" class="ts-btn ts-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span>Quản lý sản phẩm</span>
          </router-link>
          <router-link to="/orders" class="ts-btn ts-btn--ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Xem đơn hàng</span>
          </router-link>
        </div>

        <div class="ts-hero-stats">
          <div class="ts-stat"><strong>{{ stats.products }}</strong><span>Sản phẩm</span></div>
          <div class="ts-stat-divider"></div>
          <div class="ts-stat"><strong>{{ stats.orders }}</strong><span>Đơn hàng</span></div>
          <div class="ts-stat-divider"></div>
          <div class="ts-stat"><strong>{{ stats.revenue }}</strong><span>Doanh thu</span></div>
        </div>
      </div>
    </section>

    <!-- ═══════════ QUICK NAV ═══════════ -->
    <section class="ts-quicknav">
      <div class="ts-container">
        <div class="ts-quicknav-label">TRUY CẬP NHANH</div>
        <div class="ts-quicknav-grid">
          <router-link
            v-for="nav in quickNavs"
            :key="nav.label"
            :to="nav.to"
            class="ts-nav-item"
          >
            <div class="ts-nav-icon-wrap">
              <span class="ts-nav-icon">{{ nav.icon }}</span>
              <div class="ts-nav-glow"></div>
            </div>
            <span>{{ nav.label }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══════════ VIDEO BANNER ═══════════ -->
    <section class="ts-video-main">
      <div class="ts-container">
        <div class="ts-section-header">
          <h2 class="ts-section-title">Banner <em>cửa hàng</em></h2>
          <p class="ts-section-sub">Video banner hiển thị trên trang chủ khách hàng</p>
        </div>
        <div class="ts-video-frame">
          <div class="ts-video-border-glow"></div>
          <video ref="mainVideoRef" autoplay muted loop playsinline class="ts-video-el">
            <source :src="mainVideo" type="video/mp4" />
          </video>
          <div class="ts-video-corner ts-video-corner--tl"></div>
          <div class="ts-video-corner ts-video-corner--tr"></div>
          <div class="ts-video-corner ts-video-corner--bl"></div>
          <div class="ts-video-corner ts-video-corner--br"></div>
          <div class="ts-video-label">BANNER CHÍNH</div>
        </div>
      </div>
    </section>

    <!-- ═══════════ DANH MỤC ═══════════ -->
    <section class="ts-cats">
      <div class="ts-container">
        <div class="ts-cats-label">DANH MỤC SẢN PHẨM</div>
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

    <!-- ═══════════ SMALL VIDEOS ═══════════ -->
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

    <!-- ═══════════ HOT PRODUCTS ═══════════ -->
    <section class="ts-hot-section">
      <div class="ts-container">
        <div class="ts-section-row">
          <h2 class="ts-section-title">🔥 <em>Bán chạy</em> nhất</h2>
          <router-link to="/products" class="ts-link-all">Quản lý tất cả →</router-link>
        </div>
        <div class="ts-hot-scroll">
          <div v-for="product in hotProducts" :key="product._id" class="ts-hot-card">
            <router-link :to="`/products/${product._id}`" class="ts-hot-inner">
              <div class="ts-hot-img-wrap">
                <img :src="smallCover(getProductImage(product))" alt="" />
                <div class="ts-hot-badge">HOT</div>
                <div class="ts-hot-overlay">
                  <button class="ts-btn-view">Xem / Sửa</button>
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

    <!-- ═══════════ NEW ARRIVALS ═══════════ -->
    <section class="ts-arrivals">
      <div class="ts-container">
        <div class="ts-section-row mb-5">
          <div>
            <h2 class="ts-section-title">📱 Mới nhập <em>kho</em></h2>
            <p class="ts-section-sub">Sản phẩm vừa được thêm vào hệ thống</p>
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
                  <router-link :to="`/products/edit/${product._id}`" class="ts-icon-btn" title="Sửa">✏️</router-link>
                  <button class="ts-icon-btn" title="Xóa">🗑️</button>
                </div>
              </div>
              <div class="ts-arrival-info">
                <h6>{{ product.name }}</h6>
                <div class="ts-stock-row">
                  <span class="ts-stock-dot" :class="{ out: product.stock === 0 }"></span>
                  <span class="ts-stock-txt" :class="{ out: product.stock === 0 }">
                    {{ product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng' }}
                  </span>
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

const stats = ref({ products: "—", orders: "—", revenue: "—" });

const quickNavs = [
  { icon: "📦", label: "Sản phẩm", to: "/products" },
  { icon: "🛒", label: "Đơn hàng", to: "/orders" },
  { icon: "👥", label: "Khách hàng", to: "/users" },
  { icon: "⭐", label: "Đánh giá", to: "/reviews" },
  { icon: "📊", label: "Thống kê", to: "/stats" },
  { icon: "⚙️", label: "Cài đặt", to: "/settings" },
];

const brands = [
  { name: "Tai Nghe", logo: TaiNghe },
  { name: "Củ sạc", logo: CuSac },
  { name: "Cáp sạc", logo: CapSac },
  { name: "Kính cường lực", logo: KinhCuongLuc },
  { name: "Pin dự phòng", logo: PinDuPhong },
  { name: "Sạc không dây", logo: SacKhongDay },
];

const hotProducts = ref([]);
const newArrivals = ref([]);

const toggleAllVideos = () => {
  const videos = [];
  if (mainVideoRef.value) videos.push(mainVideoRef.value);
  document.querySelectorAll(".ts-small-vid video").forEach(v => videos.push(v));
  if (allPlaying.value) videos.forEach(v => v.pause());
  else videos.forEach(v => v.play());
  allPlaying.value = !allPlaying.value;
};

const getProductImage = (product) => {
  if (!product) return null;
  if (typeof product.image === "string") return product.image;
  if (typeof product.thumbnail === "string") return product.thumbnail;
  if (Array.isArray(product.images))
    return product.images[0]?.secure_url || product.images[0]?.url || product.images[0];
  return null;
};

const smallCover = (url) => {
  if (!url) return "https://via.placeholder.com/300x300";
  if (url.includes("cloudinary"))
    return url.replace("/upload/", "/upload/c_fill,w_300,h_300,q_auto,f_auto/");
  return url;
};

onMounted(async () => {
  try {
    const res = await productService.getAll({ limit: 16, sortBy: "sold", sortOrder: "desc" });
    const products = (res.products || res).slice(0, 16);
    hotProducts.value = products.slice(0, 8);
    newArrivals.value = products.slice(8, 16);
    stats.value.products = products.length + "+";
  } catch (err) { console.log(err); }
});

onUnmounted(() => {});
</script>

<style scoped>
/* ═══ TOKENS ═══ */
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

  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--ts-bg);
  color: var(--ts-text);
  overflow-x: hidden;
  min-height: 100vh;
}

/* ── LAYOUT ── */
.ts-container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.ts-section-header { margin-bottom: 48px; }
.ts-section-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800; letter-spacing: -.02em; line-height: 1.1;
  color: var(--ts-text); margin: 0;
}
.ts-section-title em {
  font-style: normal;
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.ts-section-sub { color: var(--ts-text-dim); margin-top: 8px; font-size: 1rem; }
.ts-section-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.ts-link-all { color: var(--ts-accent); font-weight: 600; text-decoration: none; font-size: .95rem; transition: opacity .2s; }
.ts-link-all:hover { opacity: .7; }
.text-center { text-align: center; }
.mb-4 { margin-bottom: 24px; }
.mb-5 { margin-bottom: 40px; }

/* ── BUTTONS ── */
.ts-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 999px;
  font-weight: 700; font-size: .95rem; cursor: pointer;
  text-decoration: none; border: none; transition: all .25s;
}
.ts-btn--primary {
  background: linear-gradient(135deg, var(--ts-accent), var(--ts-accent-3));
  color: #000; box-shadow: 0 8px 24px rgba(0,212,255,.3);
}
.ts-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,212,255,.45); }
.ts-btn--ghost {
  background: rgba(255,255,255,.06); color: var(--ts-text);
  border: 1px solid var(--ts-border); backdrop-filter: blur(8px);
}
.ts-btn--ghost:hover { background: rgba(255,255,255,.1); }
.ts-btn--sm { padding: 10px 20px; font-size: .875rem; }

/* ═══ VIDEO FAB ═══ */
.ts-video-fab { position: fixed; bottom: 32px; left: 32px; z-index: 9999; }
.ts-fab-btn {
  display: flex; align-items: center; gap: 10px;
  background: var(--ts-surface-2); border: 1px solid var(--ts-border);
  color: var(--ts-text); padding: 12px 20px; border-radius: 999px;
  cursor: pointer; font-weight: 600; backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,.5); transition: all .25s;
}
.ts-fab-btn:hover { transform: translateY(-3px); border-color: var(--ts-accent); }
.ts-fab-icon { font-size: 1.1rem; }
.ts-fab-label { font-size: .875rem; }

/* ═══ HERO ═══ */
.ts-hero {
  min-height: 100vh; display: flex; align-items: center;
  background-size: cover; background-position: center;
  position: relative; overflow: hidden;
}
.ts-hero-overlay { position: absolute; inset: 0; }
.ts-hero-overlay--dark { background: rgba(5,8,16,.88); }
.ts-hero-overlay--gradient {
  background: linear-gradient(135deg, rgba(0,212,255,.05) 0%, transparent 50%, rgba(168,85,247,.05) 100%);
}
.ts-hero-noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: .5;
}
.ts-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
.ts-orb--1 { width: 500px; height: 500px; background: rgba(0,212,255,.08); top: -100px; left: -150px; animation: drift1 8s ease-in-out infinite; }
.ts-orb--2 { width: 400px; height: 400px; background: rgba(168,85,247,.08); bottom: -80px; right: -100px; animation: drift2 10s ease-in-out infinite; }
.ts-orb--3 { width: 300px; height: 300px; background: rgba(255,107,53,.06); top: 40%; right: 20%; animation: drift1 12s ease-in-out infinite reverse; }
@keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-30px)} }
@keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }

.ts-admin-badge-wrap {
  position: absolute; top: 28px; right: 32px; z-index: 3;
}
.ts-admin-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3);
  color: #fca5a5; padding: 8px 20px; border-radius: 999px;
  font-size: .78rem; font-weight: 700; letter-spacing: .08em;
  backdrop-filter: blur(8px);
}
.ts-admin-badge-icon { width: 14px; height: 14px; }

.ts-hero-content {
  position: relative; z-index: 2;
  width: 100%; max-width: 800px; margin: 0 auto;
  padding: 80px 24px; text-align: center;
}
.ts-hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
  color: #fca5a5; padding: 8px 20px; border-radius: 999px;
  font-size: .875rem; font-weight: 600; margin-bottom: 32px; letter-spacing: .05em;
}
.ts-badge-dot {
  width: 8px; height: 8px; background: #ef4444;
  border-radius: 50%; animation: blink 2s ease-in-out infinite;
  box-shadow: 0 0 8px #ef4444;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

.ts-hero-title { display: flex; flex-direction: column; gap: 4px; margin: 0 0 24px; }
.ts-title-line { display: block; line-height: 1.05; }
.ts-title-line--dim {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  color: var(--ts-text-dim); font-weight: 400; letter-spacing: .3em; text-transform: uppercase;
}
.ts-title-line--main {
  font-size: clamp(3rem, 9vw, 7rem);
  font-weight: 900; color: var(--ts-text); letter-spacing: -.03em;
}
.ts-title-line--accent {
  font-size: clamp(1.8rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -.01em;
  background: linear-gradient(135deg, #ef4444, #f97316, #a855f7);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.ts-hero-sub { color: var(--ts-text-dim); font-size: 1.1rem; margin-bottom: 40px; line-height: 1.8; }
.ts-hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; }

.ts-hero-stats { display: flex; align-items: center; justify-content: center; gap: 24px; }
.ts-stat { display: flex; flex-direction: column; gap: 2px; }
.ts-stat strong { font-size: 1.4rem; font-weight: 800; color: var(--ts-text); }
.ts-stat span { font-size: .78rem; color: var(--ts-text-dim); text-transform: uppercase; letter-spacing: .08em; }
.ts-stat-divider { width: 1px; height: 36px; background: var(--ts-border); }

/* ═══ QUICK NAV ═══ */
.ts-quicknav {
  background: var(--ts-surface);
  border-top: 1px solid var(--ts-border);
  border-bottom: 1px solid var(--ts-border);
  padding: 48px 0;
}
.ts-quicknav-label {
  font-size: .7rem; letter-spacing: .2em;
  color: var(--ts-text-dim); margin-bottom: 24px; text-align: center;
}
.ts-quicknav-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; }
.ts-nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  font-size: .85rem; color: var(--ts-text-dim); cursor: pointer;
  text-decoration: none; transition: color .2s;
}
.ts-nav-item:hover { color: var(--ts-text); }
.ts-nav-icon-wrap {
  position: relative; width: 72px; height: 72px; border-radius: 18px;
  background: var(--ts-surface-2);
  border: 1px solid var(--ts-border); overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .2s;
}
.ts-nav-item:hover .ts-nav-icon-wrap { border-color: var(--ts-accent); }
.ts-nav-icon { font-size: 1.8rem; }
.ts-nav-glow {
  position: absolute; inset: 0;
  background: radial-gradient(circle, rgba(0,212,255,.18), transparent 70%);
  opacity: 0; transition: opacity .2s;
}
.ts-nav-item:hover .ts-nav-glow { opacity: 1; }

/* ═══ CATEGORIES ═══ */
.ts-cats {
  background: var(--ts-bg);
  padding: 48px 0;
}
.ts-cats-label {
  font-size: .7rem; letter-spacing: .2em;
  color: var(--ts-text-dim); margin-bottom: 24px; text-align: center;
}
.ts-cats-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; }
.ts-cat-item {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  font-size: .85rem; color: var(--ts-text-dim); cursor: pointer; transition: color .2s;
}
.ts-cat-item:hover { color: var(--ts-text); }
.ts-cat-img-wrap {
  position: relative; width: 72px; height: 72px; border-radius: 50%;
  overflow: hidden; border: 2px solid var(--ts-border); transition: border-color .2s;
}
.ts-cat-item:hover .ts-cat-img-wrap { border-color: var(--ts-accent); }
.ts-cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.ts-cat-glow {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,255,.15), transparent 70%);
  opacity: 0; transition: opacity .2s;
}
.ts-cat-item:hover .ts-cat-glow { opacity: 1; }

/* ═══ VIDEO MAIN ═══ */
.ts-video-main { padding: 96px 0; background: var(--ts-surface); border-top: 1px solid var(--ts-border); }
.ts-video-frame {
  position: relative; border-radius: var(--ts-radius-lg);
  overflow: hidden; margin-top: 40px;
}
.ts-video-border-glow {
  position: absolute; inset: -2px; border-radius: inherit; z-index: 0;
  background: linear-gradient(135deg, #ef4444, var(--ts-accent-3), var(--ts-accent));
  filter: blur(1px);
}
.ts-video-el {
  position: relative; z-index: 1;
  width: 100%; max-height: 600px; object-fit: cover;
  display: block; border-radius: var(--ts-radius-lg);
}
.ts-video-corner {
  position: absolute; z-index: 2; width: 24px; height: 24px;
  border-color: #ef4444; border-style: solid;
}
.ts-video-corner--tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
.ts-video-corner--tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
.ts-video-corner--bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
.ts-video-corner--br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }
.ts-video-label {
  position: absolute; top: 16px; right: 16px; z-index: 3;
  background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.3);
  color: #fca5a5; padding: 5px 14px; border-radius: 999px;
  font-size: .72rem; font-weight: 700; letter-spacing: .1em;
  backdrop-filter: blur(8px);
}

/* ═══ SMALL VIDEOS ═══ */
.ts-video-grid-section { padding: 64px 0; background: var(--ts-bg); }
.ts-small-video-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.ts-small-vid {
  position: relative; border-radius: 12px; overflow: hidden;
  border: 1px solid var(--ts-border);
}
.ts-small-vid video { width: 180px; height: 100px; object-fit: cover; display: block; transition: transform .3s; }
.ts-small-vid:hover video { transform: scale(1.07); }
.ts-small-vid-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(5,8,16,.5), transparent);
  pointer-events: none;
}

/* ═══ HOT PRODUCTS ═══ */
.ts-hot-section {
  padding: 96px 0;
  background: linear-gradient(160deg, #08101a, var(--ts-bg));
}
.ts-hot-scroll {
  display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin; scrollbar-color: var(--ts-border) transparent;
}
.ts-hot-card { flex: 0 0 220px; scroll-snap-align: start; }
.ts-hot-inner {
  display: block; text-decoration: none; color: var(--ts-text);
  background: var(--ts-surface); border: 1px solid var(--ts-border);
  border-radius: var(--ts-radius-lg); overflow: hidden; transition: all .3s;
}
.ts-hot-inner:hover {
  border-color: rgba(239,68,68,.4);
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0,0,0,.4), 0 0 40px rgba(239,68,68,.1);
}
.ts-hot-img-wrap { position: relative; overflow: hidden; }
.ts-hot-img-wrap img { width: 100%; height: 250px; object-fit: cover; transition: transform .4s; }
.ts-hot-inner:hover .ts-hot-img-wrap img { transform: scale(1.08); }
.ts-hot-badge {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, var(--ts-accent-2), #dc2626);
  color: #fff; padding: 4px 12px; border-radius: 999px;
  font-size: .7rem; font-weight: 800; letter-spacing: .1em;
}
.ts-hot-overlay {
  position: absolute; inset: 0; background: rgba(5,8,16,.6);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .3s;
}
.ts-hot-inner:hover .ts-hot-overlay { opacity: 1; }
.ts-btn-view {
  background: #ef4444; color: #fff;
  border: none; padding: 10px 20px; border-radius: 999px;
  font-weight: 700; cursor: pointer; font-size: .85rem;
  transition: background .2s;
}
.ts-btn-view:hover { background: #dc2626; }
.ts-hot-info { padding: 16px; }
.ts-hot-info h6 { font-size: .9rem; font-weight: 600; margin-bottom: 6px; line-height: 1.4; }
.ts-price { color: var(--ts-gold); font-weight: 700; margin: 0; font-size: .95rem; }
.ts-sold { font-size: .78rem; color: var(--ts-text-dim); margin-top: 4px; }

/* ═══ NEW ARRIVALS ═══ */
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
  border-radius: var(--ts-radius-lg); overflow: hidden; transition: all .3s;
}
.ts-arrival-card:hover {
  border-color: rgba(16,185,129,.4);
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0,0,0,.3), 0 0 30px rgba(16,185,129,.08);
}
.ts-arrival-card a { display: block; text-decoration: none; color: var(--ts-text); }
.ts-arrival-img-wrap { position: relative; overflow: hidden; }
.ts-arrival-img-wrap img { width: 100%; height: 200px; object-fit: cover; transition: transform .4s; }
.ts-arrival-card:hover .ts-arrival-img-wrap img { transform: scale(1.12) rotate(1deg); }
.ts-new-tag {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, var(--ts-green), #059669);
  color: #fff; padding: 4px 12px; border-radius: 999px;
  font-size: .7rem; font-weight: 800; letter-spacing: .1em;
}
.ts-arrival-actions {
  position: absolute; bottom: 10px; right: 10px;
  display: flex; gap: 6px;
  opacity: 0; transform: translateY(8px); transition: all .3s;
}
.ts-arrival-card:hover .ts-arrival-actions { opacity: 1; transform: translateY(0); }
.ts-icon-btn {
  width: 36px; height: 36px;
  background: rgba(13,17,23,.85); backdrop-filter: blur(8px);
  border: 1px solid var(--ts-border); border-radius: 50%;
  cursor: pointer; font-size: .9rem;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .2s; text-decoration: none;
}
.ts-icon-btn:hover { border-color: var(--ts-accent); }
.ts-arrival-info { padding: 16px; }
.ts-arrival-info h6 { font-size: .875rem; font-weight: 600; margin-bottom: 6px; line-height: 1.4; }

.ts-stock-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.ts-stock-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ts-green); box-shadow: 0 0 6px var(--ts-green);
  animation: blink 2s ease-in-out infinite; flex-shrink: 0;
}
.ts-stock-dot.out { background: #475569; box-shadow: none; animation: none; }
.ts-stock-txt { font-size: .72rem; font-weight: 600; color: var(--ts-green); }
.ts-stock-txt.out { color: #475569; }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .ts-hero-content { padding: 100px 24px 60px; }
  .ts-section-row { flex-direction: column; align-items: flex-start; }
  .ts-hero-stats { gap: 16px; }
  .ts-fab-label { display: none; }
  .ts-admin-badge-wrap { top: 16px; right: 16px; }
}
</style>