<template>
  <div v-if="product" class="page">

    <!-- ═══════════ HERO BANNER ═══════════ -->
    <div class="hero-banner">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <nav class="breadcrumb">
        <span>Trang chủ</span>
        <span class="sep">›</span>
        <span>Sản phẩm</span>
        <span class="sep">›</span>
        <span class="current">{{ product.name }}</span>
      </nav>
    </div>

    <!-- ═══════════ PRODUCT LAYOUT ═══════════ -->
    <div class="product-shell">

      <!-- GALLERY -->
      <div class="gallery-col">
        <div class="main-image-wrap">
          <span v-if="discountPercent" class="badge-sale">-{{ discountPercent }}%</span>
          <img :src="currentImage" class="main-image" />
          <div class="image-glow"></div>
        </div>

        <div class="thumb-list">
          <div
            v-for="(img, i) in product.images"
            :key="i"
            class="thumb"
            :class="{ active: currentImage === img }"
            @click="currentImage = img"
          >
            <img :src="img" />
          </div>
        </div>
      </div>

      <!-- BUYBOX -->
      <div class="buybox">

        <div class="brand-tag">{{ product.brand || 'Chính hãng' }}</div>
        <h1 class="title">{{ product.name }}</h1>

        <div class="meta-row">
          <div class="stars">
            <span v-for="i in 5" :key="i" class="star" :class="{ lit: i <= Math.round(product.rating || 4.8) }">★</span>
            <span class="rating-val">{{ product.rating || 4.8 }}</span>
          </div>
          <span class="divider-dot">·</span>
          <span class="sold-count">Đã bán <b>{{ product.sold }}</b></span>
        </div>

        <!-- PRICE -->
        <div class="price-card">
          <div class="price-inner">
            <span class="price-sale">{{ formatPrice(product.salePrice || product.price) }}₫</span>
            <div class="price-right" v-if="product.salePrice">
              <span class="price-origin">{{ formatPrice(product.price) }}₫</span>
              <span class="price-badge">Tiết kiệm {{ formatPrice(product.price - product.salePrice) }}₫</span>
            </div>
          </div>
        </div>

        <!-- PERKS -->
        <div class="perks">
          <div class="perk">
            <span class="perk-icon">🎫</span>
            <span>Giảm thêm <b>50K</b> cho đơn từ 1 triệu</span>
          </div>
          <div class="perk">
            <span class="perk-icon">🚚</span>
            <span>Giao từ <b>Cần Thơ</b> · Nhận trong <b>2-4 ngày</b></span>
          </div>
          <div class="perk">
            <span class="perk-icon">🛡️</span>
            <span>Bảo hành <b>{{ product.warrantyMonths }} tháng</b> chính hãng</span>
          </div>
        </div>

        <!-- STOCK -->
        <div class="stock-row">
          <span class="stock-dot" :class="{ out: product.stock === 0 }"></span>
          <span class="stock-txt" :class="{ out: product.stock === 0 }">
            {{ product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng' }}
          </span>
        </div>

        <!-- QTY -->
        <div class="qty-row">
          <span class="qty-label">Số lượng</span>
          <div class="qty-control">
            <button class="qty-btn" @click="decrease">−</button>
            <span class="qty-num">{{ quantity }}</span>
            <button class="qty-btn" @click="increase">+</button>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="actions">
          <button
            class="btn-cart"
            :disabled="product.stock === 0"
            @click="addToCart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="btn-icon">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Thêm vào giỏ
            <span class="btn-shine"></span>
          </button>

          <button class="btn-buy" @click="buyNow">
            ⚡ Mua ngay
          </button>
        </div>

        <button
          class="btn-fav"
          :class="{ favorited: isFavorited }"
          @click="toggleFavorite"
        >
          {{ isFavorited ? '❤️ Đã yêu thích' : '🤍 Thêm vào yêu thích' }}
        </button>

        <!-- TRUST -->
        <div class="trust-strip">
          <div class="trust-item"><span>✔</span> Hàng chính hãng</div>
          <div class="trust-item"><span>✔</span> 7 ngày đổi trả</div>
          <div class="trust-item"><span>✔</span> Hỗ trợ 24/7</div>
        </div>

      </div>
    </div>

    <!-- ═══════════ SHOP CARD ═══════════ -->
    <div class="shop-card">
      <div class="shop-avatar">NA</div>
      <div class="shop-info">
        <b class="shop-name">Nhựt Anh Store</b>
        <p class="shop-meta">⭐ 4.9 &nbsp;·&nbsp; 1.2k sản phẩm &nbsp;·&nbsp; 98% phản hồi tốt</p>
      </div>
      <div class="shop-actions">
        <button class="shop-btn">Xem shop</button>
        <button class="shop-btn primary">💬 Chat ngay</button>
      </div>
    </div>

    <!-- ═══════════ TABS ═══════════ -->
    <div class="tabs-block">
      <div class="tab-header">
        <button
          v-for="t in tabs"
          :key="t"
          class="tab-btn"
          :class="{ active: tab === t }"
          @click="tab = t"
        >
          {{ t }}
        </button>
      </div>

      <div class="tab-body">
        <div v-if="tab === 'Mô tả'" class="tab-desc">
          <p>{{ product.description }}</p>
        </div>

        <div v-if="tab === 'Thông số'" class="tab-specs">
          <div
            v-for="([key, value]) in specEntries"
            :key="key"
            class="spec-row"
          >
            <span class="spec-key">{{ formatKey(key) }}</span>
            <span class="spec-val">{{ value }}</span>
          </div>
        </div>

        <div v-if="tab === 'Đánh giá'" class="tab-content">
          <ProductReview
            :product-id="product._id"
            :current-user-id="currentUserId"
          />
        </div>
      </div>
    </div>

    <!-- ═══════════ GỢI Ý SẢN PHẨM (thay thế related cũ) ═══════════ -->
    <div class="related-section">
      <ProductRecommendation
        :product-id="product._id"
        :limit="4"
        @add-to-cart="onRecommendationAddToCart"
      />
    </div>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="showToast" class="toast">
        <div class="toast-icon">✓</div>
        <div class="toast-text">
          <span class="toast-title">Đã thêm vào giỏ</span>
          <span class="toast-name">{{ toastProductName }}</span>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import CartService from "@/services/cart.service";
import ProductReview from "@/components/ProductReview.vue";
import ProductRecommendation from "@/components/ProductRecommendation.vue"; 

const route = useRoute();
const router = useRouter();

const product         = ref(null);
const currentImage    = ref("");
const quantity        = ref(1);
const showToast       = ref(false);
const toastProductName = ref(""); // 
const isFavorited     = ref(false);

const tabs = ["Mô tả", "Thông số", "Đánh giá"];
const tab  = ref("Mô tả");

const currentUserId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user._id || user.id || "";
  } catch { return ""; }
});

const discountPercent = computed(() => {
  if (!product.value?.salePrice) return 0;
  return Math.round(100 - (product.value.salePrice / product.value.price) * 100);
});

const specEntries = computed(() => {
  if (!product.value?.specs) return [];
  return Object.entries(product.value.specs).filter(([, v]) => v);
});

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v);
const formatKey   = (k) => k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

function increase() { if (quantity.value < product.value.stock) quantity.value++; }
function decrease() { if (quantity.value > 1) quantity.value--; }

function showToastMsg(name) {
  toastProductName.value = name;
  showToast.value = true;
  setTimeout(() => (showToast.value = false), 2800);
}

async function addToCart() {
  await CartService.addToCart(product.value._id, quantity.value);
  showToastMsg(product.value.name);
}

async function buyNow() {
  await addToCart();
  router.push("/checkout");
}

// Khi ProductRecommendation emit add-to-cart
function onRecommendationAddToCart(recommendedProduct) {
  showToastMsg(recommendedProduct.name);
}

function toggleFavorite() {
  let fav = JSON.parse(localStorage.getItem("favorite") || "[]");
  if (fav.includes(product.value._id)) {
    fav = fav.filter((id) => id !== product.value._id);
    isFavorited.value = false;
  } else {
    fav.push(product.value._id);
    isFavorited.value = true;
  }
  localStorage.setItem("favorite", JSON.stringify(fav));
}

onMounted(async () => {
  const res = await ProductService.get(route.params.id);
  product.value   = res;
  currentImage.value = res.images?.[0] || "https://via.placeholder.com/600";
  const fav = JSON.parse(localStorage.getItem("favorite") || "[]");
  isFavorited.value = fav.includes(res._id);
});
</script>

<style scoped>
/* ═══ BASE ═══ */
.page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ═══ HERO BANNER ═══ */
.hero-banner {
  position: relative; overflow: hidden;
  background: #0a0f1e;
  padding: 28px 40px 64px;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 10% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 90% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 280px; height: 280px; background: rgba(37,99,235,.25); top: -80px; left: -40px; }
.hero-orb-2 { width: 220px; height: 220px; background: rgba(124,58,237,.2); bottom: -50px; right: -30px; }

.breadcrumb {
  position: relative; z-index: 2;
  font-size: .8rem; color: rgba(255,255,255,.45);
  display: flex; align-items: center; gap: 6px;
  max-width: 1200px; margin: 0 auto;
}
.breadcrumb .sep { color: rgba(255,255,255,.25); }
.breadcrumb .current { color: rgba(255,255,255,.8); font-weight: 600; }

/* ═══ SHELL ═══ */
.product-shell {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 32px;
  max-width: 1200px;
  margin: -32px auto 0;
  padding: 0 24px;
  position: relative; z-index: 10;
}

/* ═══ GALLERY ═══ */
.gallery-col { display: flex; flex-direction: column; gap: 14px; }

.main-image-wrap {
  position: relative;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 20px 60px rgba(10,15,30,.1);
}
.main-image {
  width: 100%; height: 440px;
  object-fit: contain; display: block;
  transition: transform .4s ease;
}
.main-image-wrap:hover .main-image { transform: scale(1.04); }
.image-glow {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 100%, rgba(37,99,235,.06), transparent);
  pointer-events: none;
}
.badge-sale {
  position: absolute; top: 14px; left: 14px; z-index: 3;
  background: linear-gradient(135deg, #e11d48, #f97316);
  color: white; font-size: .7rem; font-weight: 800;
  padding: 4px 12px; border-radius: 999px;
  box-shadow: 0 4px 14px rgba(225,29,72,.4);
  letter-spacing: .04em;
}

.thumb-list { display: flex; gap: 10px; }
.thumb {
  width: 72px; height: 72px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 14px; overflow: hidden;
  background: white;
  box-shadow: 0 4px 14px rgba(10,15,30,.08);
  transition: all .2s;
}
.thumb:hover { border-color: #a5b4fc; transform: translateY(-2px); }
.thumb.active { border-color: #2563eb; box-shadow: 0 4px 18px rgba(37,99,235,.3); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

/* ═══ BUYBOX ═══ */
.buybox {
  background: white;
  border-radius: 24px;
  padding: 28px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 20px 60px rgba(10,15,30,.1);
  display: flex; flex-direction: column; gap: 16px;
}

.brand-tag {
  display: inline-flex;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff;
  color: #4f46e5; font-size: .72rem; font-weight: 800;
  padding: 4px 14px; border-radius: 999px;
  letter-spacing: .07em; text-transform: uppercase;
  align-self: flex-start;
}

.title {
  font-size: 1.6rem; font-weight: 800;
  color: #0f172a; line-height: 1.25;
  margin: 0;
}

.meta-row {
  display: flex; align-items: center; gap: 10px;
  font-size: .85rem;
}
.stars { display: flex; align-items: center; gap: 3px; }
.star { color: #e2e8f0; font-size: 1rem; }
.star.lit { color: #f59e0b; }
.rating-val { margin-left: 4px; font-weight: 700; color: #374151; }
.divider-dot { color: #cbd5e1; }
.sold-count { color: #6b7280; }
.sold-count b { color: #374151; }

/* PRICE */
.price-card {
  background: linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%);
  border-radius: 18px;
  padding: 20px 22px;
  border: 1px solid rgba(255,255,255,.08);
}
.price-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.price-sale { font-size: 2rem; font-weight: 900; color: #f87171; line-height: 1; }
.price-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.price-origin { font-size: .85rem; color: rgba(255,255,255,.35); text-decoration: line-through; }
.price-badge {
  background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.25);
  color: #34d399; font-size: .7rem; font-weight: 700;
  padding: 3px 10px; border-radius: 999px;
}

/* PERKS */
.perks { display: flex; flex-direction: column; gap: 10px; }
.perk {
  display: flex; align-items: center; gap: 10px;
  font-size: .85rem; color: #374151;
  background: #f8faff; border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid #e8edf8;
}
.perk-icon { font-size: 1rem; flex-shrink: 0; }
.perk b { color: #2563eb; }

/* STOCK */
.stock-row { display: flex; align-items: center; gap: 8px; }
.stock-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 8px #10b981;
  animation: blink 2s ease-in-out infinite;
  flex-shrink: 0;
}
.stock-dot.out { background: #94a3b8; box-shadow: none; animation: none; }
.stock-txt { font-size: .85rem; font-weight: 700; color: #10b981; }
.stock-txt.out { color: #94a3b8; }
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}

/* QTY */
.qty-row { display: flex; align-items: center; gap: 14px; }
.qty-label { font-size: .85rem; color: #6b7280; font-weight: 600; }
.qty-control {
  display: flex; align-items: center; gap: 0;
  background: #f1f5f9; border-radius: 12px; overflow: hidden;
  border: 1.5px solid #e2e8f0;
}
.qty-btn {
  width: 36px; height: 36px;
  background: transparent; border: none;
  cursor: pointer; font-size: 1.2rem; font-weight: 700;
  color: #4f46e5; transition: background .15s;
}
.qty-btn:hover { background: #e0e7ff; }
.qty-num { width: 40px; text-align: center; font-weight: 800; color: #0f172a; font-size: .95rem; }

/* ACTIONS */
.actions { display: flex; gap: 10px; }

.btn-cart {
  flex: 1.5; padding: 14px 16px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border: none; border-radius: 14px;
  font-size: .9rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  position: relative; overflow: hidden;
  box-shadow: 0 6px 20px rgba(37,99,235,.35);
  transition: transform .2s, box-shadow .2s;
}
.btn-cart:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(37,99,235,.45);
}
.btn-cart:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
.btn-icon { width: 16px; height: 16px; flex-shrink: 0; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .55s;
}
.btn-cart:hover:not(:disabled) .btn-shine { left: 130%; }

.btn-buy {
  flex: 1; padding: 14px 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white; border: none; border-radius: 14px;
  font-size: .9rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 20px rgba(16,185,129,.35);
  transition: transform .2s, box-shadow .2s;
}
.btn-buy:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(16,185,129,.45);
}

.btn-fav {
  width: 100%; padding: 11px;
  border: 1.5px solid #e0e7ff; background: white;
  border-radius: 14px; cursor: pointer;
  font-size: .85rem; font-weight: 600; color: #6b7280;
  transition: all .2s;
}
.btn-fav:hover { border-color: #fca5a5; color: #e11d48; background: #fff5f5; }
.btn-fav.favorited { border-color: #fca5a5; color: #e11d48; background: #fff5f5; }

/* TRUST */
.trust-strip {
  display: flex; gap: 6px; flex-wrap: wrap;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}
.trust-item {
  flex: 1; min-width: 100px;
  font-size: .75rem; color: #6b7280;
  background: #f8faff; border-radius: 10px;
  padding: 8px 10px; text-align: center;
  border: 1px solid #e8edf8;
}
.trust-item span { color: #10b981; font-weight: 700; margin-right: 4px; }

/* ═══ SHOP CARD ═══ */
.shop-card {
  max-width: 1200px;
  margin: 24px auto;
  padding: 20px 28px;
  display: flex; align-items: center; gap: 18px;
  background: white; border-radius: 20px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.08);
}
.shop-avatar {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-size: .9rem; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(37,99,235,.3);
}
.shop-info { flex: 1; }
.shop-name { font-size: 1rem; font-weight: 800; color: #0f172a; display: block; }
.shop-meta { font-size: .78rem; color: #6b7280; margin: 2px 0 0; }
.shop-actions { display: flex; gap: 10px; }
.shop-btn {
  padding: 9px 18px; border-radius: 10px;
  border: 1.5px solid #e0e7ff; background: white;
  color: #4f46e5; font-weight: 700; font-size: .82rem;
  cursor: pointer; transition: all .2s;
}
.shop-btn:hover { background: #eff6ff; border-color: #a5b4fc; }
.shop-btn.primary {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border-color: transparent;
  box-shadow: 0 4px 14px rgba(37,99,235,.3);
}
.shop-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.4); }

/* ═══ TABS ═══ */
.tabs-block {
  max-width: 1200px; margin: 0 auto 24px;
  background: white; border-radius: 20px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.07);
  overflow: hidden;
}
.tab-header {
  display: flex;
  border-bottom: 1.5px solid #f1f5f9;
  padding: 0 20px;
}
.tab-btn {
  padding: 16px 24px;
  border: none; background: transparent;
  cursor: pointer; font-size: .88rem; font-weight: 600;
  color: #94a3b8; position: relative;
  transition: color .2s;
}
.tab-btn::after {
  content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px;
  background: #2563eb; border-radius: 2px;
  transform: scaleX(0); transition: transform .25s;
}
.tab-btn:hover { color: #4f46e5; }
.tab-btn.active { color: #2563eb; }
.tab-btn.active::after { transform: scaleX(1); }
.tab-body { padding: 24px 28px; }
.tab-desc p { font-size: .92rem; color: #374151; line-height: 1.8; }
.tab-specs { display: flex; flex-direction: column; }
.spec-row {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding: 13px 0; font-size: .88rem;
}
.spec-row:last-child { border-bottom: none; }
.spec-key { color: #94a3b8; font-weight: 500; }
.spec-val { color: #0f172a; font-weight: 700; text-align: right; }

/* ═══ RELATED SECTION (bọc ProductRecommendation) ═══ */
.related-section {
  max-width: 1200px; margin: 0 auto 48px;
  padding: 0 24px;
}

/* ═══ TOAST ═══ */
.toast {
  position: fixed; top: 24px; right: 24px; z-index: 200;
  background: #0a0f1e; color: white;
  border-radius: 16px; padding: 14px 20px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,.3);
  border: 1px solid rgba(255,255,255,.08);
  min-width: 260px;
}
.toast-icon {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; font-weight: 900; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16,185,129,.4);
}
.toast-text { display: flex; flex-direction: column; gap: 2px; }
.toast-title { font-size: .72rem; font-weight: 700; color: #10b981; letter-spacing: .04em; text-transform: uppercase; }
.toast-name { font-size: .86rem; color: rgba(255,255,255,.8); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.toast-enter-active { animation: toastSlide .4s cubic-bezier(.175,.885,.32,1.275); }
.toast-leave-active { animation: toastSlide .3s ease reverse; }
@keyframes toastSlide {
  from { opacity: 0; transform: translateX(40px) scale(.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 900px) {
  .product-shell { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .hero-banner { padding: 20px 20px 50px; }
  .product-shell { margin: -20px auto 0; padding: 0 14px; }
  .shop-card { flex-direction: column; align-items: flex-start; margin: 14px; padding: 18px; }
  .tabs-block, .related-section { margin: 0 0 16px; }
  .actions { flex-direction: column; }
  .btn-cart, .btn-buy { width: 100%; }
}
</style>