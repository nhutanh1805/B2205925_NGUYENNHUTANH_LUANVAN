<template>
  <div class="products-page">

    <!-- ═══════════ HERO BANNER ═══════════ -->
    <div class="hero-banner">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <nav class="breadcrumb">
          <span>Quản trị</span>
          <span class="sep">›</span>
          <span class="current">Sản phẩm</span>
        </nav>

        <!-- STATS ROW -->
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-number">{{ products.length }}</span>
            <span class="stat-label">Sản phẩm</span>
          </div>
          <div class="hero-stat">
            <span class="stat-number">{{ inStockCount }}</span>
            <span class="stat-label">Còn hàng</span>
          </div>
          <div class="hero-stat">
            <span class="stat-number">{{ onSaleCount }}</span>
            <span class="stat-label">Đang giảm</span>
          </div>
        </div>

        <!-- ADMIN TOOLBAR inside hero -->
        <div class="admin-toolbar">
          <div class="toolbar-left">
            <h1 class="hero-title">Quản lý sản phẩm</h1>
            <div class="hero-badge">
              <span class="badge-dot"></span>
              Hệ thống đang hoạt động
            </div>
          </div>

          <div class="toolbar-actions">
            <button class="btn-refresh" @click="refreshList" :class="{ spinning: isRefreshing }">
              <svg class="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Làm mới
            </button>

            <router-link to="/admin/stock-receipts" class="btn-stock">
              <span class="add-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="add-icon">
                  <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                  <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
                  <line x1="12" y1="12" x2="12" y2="17"/>
                  <line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>
                </svg>
              </span>
              Nhập kho
              <span class="btn-shine"></span>
            </router-link>

            <router-link to="/products/add" class="btn-add">
              <span class="add-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" class="add-icon">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              Thêm sản phẩm mới
              <span class="btn-shine"></span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ MAIN CONTENT ═══════════ -->
    <div class="content-shell">

      <!-- SEARCH -->
      <div class="search-wrap">
        <InputSearch
          v-model="searchText"
          @submit="refreshList"
        />
        <div class="result-count">
          <span class="count-badge">{{ filteredProductsCount }}</span>
          sản phẩm
        </div>
      </div>

      <!-- PRODUCT SCROLL -->
      <div v-if="filteredProductsCount" class="product-scroll" ref="scrollEl">
        <div
          v-for="product in filteredProducts"
          :key="product._id"
          class="mini-card"
          @click="goDetail(product._id)"
        >
          <span v-if="product.salePrice" class="badge badge-sale">-{{ discountOf(product) }}%</span>
          <span v-else-if="product.stock === 0" class="badge badge-out">HẾT</span>

          <div class="img-wrap">
            <img
              :src="product.images?.[0] || placeholder"
              class="mini-img"
              loading="lazy"
            />
          </div>

          <div class="mini-body">
            <p class="mini-brand">{{ product.brand }}</p>
            <h4 class="mini-name">{{ product.name }}</h4>

            <p class="mini-price">
              {{ formatPrice(product.salePrice || product.price) }}₫
            </p>
            <p class="mini-origin-price" v-if="product.salePrice">
              {{ formatPrice(product.price) }}₫
            </p>

            <span class="mini-stock" :class="{ 'out-stock': product.stock === 0 }">
              <span class="stock-dot" :class="{ out: product.stock === 0 }"></span>
              {{ product.stock === 0 ? 'Hết hàng' : `Còn ${product.stock}` }}
            </span>
          </div>
        </div>
      </div>

      <p v-else class="empty-state">
        <span class="empty-icon">🔍</span>
        Không có sản phẩm phù hợp
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import InputSearch from "@/components/InputSearch.vue";

const router = useRouter();

const products = ref([]);
const searchText = ref("");
const isRefreshing = ref(false);
const scrollEl = ref(null);
const placeholder = "https://via.placeholder.com/112x160";

onMounted(async () => {
  await refreshList();
  nextTick(initDragScroll);
});

function goDetail(id) {
  router.push(`/products/${id}`);
}

async function refreshList() {
  isRefreshing.value = true;
  try {
    const res = await ProductService.getAll({ page: 1, limit: 999 });
    products.value = res.products || res;
  } finally {
    setTimeout(() => { isRefreshing.value = false; }, 600);
  }
}

const inStockCount  = computed(() => products.value.filter(p => p.stock > 0).length);
const onSaleCount   = computed(() => products.value.filter(p => p.salePrice).length);

const productStrings = computed(() =>
  products.value.map(p => `${p.name}${p.brand}${p.imei || ""}`.toLowerCase())
);

const filteredProducts = computed(() =>
  !searchText.value
    ? products.value
    : products.value.filter((_, i) =>
        productStrings.value[i].includes(searchText.value.toLowerCase())
      )
);

const filteredProductsCount = computed(() => filteredProducts.value.length);

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v);
const discountOf  = p => Math.round(100 - (p.salePrice / p.price) * 100);

function initDragScroll() {
  const el = scrollEl.value;
  if (!el) return;
  let isDown = false, startX = 0, scrollLeft = 0;

  el.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    el.classList.add("dragging");
  });

  ["mouseleave", "mouseup"].forEach(ev =>
    el.addEventListener(ev, () => { isDown = false; el.classList.remove("dragging"); })
  );

  el.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.3;
  });
}
</script>

<style scoped>
/* ═══ BASE ═══ */
.products-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ═══ HERO BANNER ═══ */
.hero-banner {
  position: relative;
  overflow: hidden;
  background: #0a0f1e;
  padding: 0 0 72px;
}

.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 10% 0%,  rgba(37,99,235,.35),  transparent),
    radial-gradient(ellipse 60% 50% at 90% 100%, rgba(124,58,237,.3),  transparent),
    radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(220,38,38,.05),  transparent);
}

.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25);  top: -80px;   left: -50px;  }
.hero-orb-2 { width: 240px; height: 240px; background: rgba(124,58,237,.2);  bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.12); top: 40%;     right: 20%;   }

.hero-content {
  position: relative; z-index: 2;
  max-width: 1200px; margin: 0 auto;
  padding: 28px 24px 0;
  display: flex; flex-direction: column; gap: 22px;
}

/* BREADCRUMB */
.breadcrumb {
  font-size: .8rem; color: rgba(255,255,255,.45);
  display: flex; align-items: center; gap: 6px;
}
.breadcrumb .sep     { color: rgba(255,255,255,.2); }
.breadcrumb .current { color: rgba(255,255,255,.8); font-weight: 600; }

/* STATS */
.hero-stats { display: flex; gap: 14px; flex-wrap: wrap; }
.hero-stat {
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 16px;
  padding: 12px 20px;
  min-width: 90px;
  transition: transform .2s;
}
.hero-stat:hover { transform: translateY(-3px); }
.stat-number { display: block; font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1.1; }
.stat-label  { font-size: .68rem; color: rgba(255,255,255,.55); letter-spacing: .07em; text-transform: uppercase; }

/* ADMIN TOOLBAR */
.admin-toolbar {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 14px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 18px;
  padding: 18px 22px;
  backdrop-filter: blur(12px);
}
.toolbar-left { display: flex; flex-direction: column; gap: 8px; }
.hero-title {
  font-size: 1.6rem; font-weight: 800; color: white;
  letter-spacing: -.02em; margin: 0;
  text-shadow: 0 2px 20px rgba(0,0,0,.3);
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.75);
  letter-spacing: .05em; width: fit-content;
}
.badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4ade80; box-shadow: 0 0 6px #4ade80;
  animation: pulse-dot 1.6s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.5; transform:scale(1.5); }
}
.toolbar-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* BTN REFRESH */
.btn-refresh {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 12px;
  font-size: .85rem; font-weight: 600;
  color: rgba(255,255,255,.75);
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  cursor: pointer; transition: all .2s;
}
.btn-refresh:hover { background: rgba(255,255,255,.14); color: white; }
.refresh-icon { width: 15px; height: 15px; transition: transform .5s; }
.btn-refresh.spinning .refresh-icon { animation: spin .6s linear; }
@keyframes spin { to { transform: rotate(360deg); } }

/* BTN STOCK */
.btn-stock {
  position: relative;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 11px 22px; border-radius: 13px;
  font-size: .9rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #0891b2, #0e7490);
  border: none; text-decoration: none; cursor: pointer;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(8,145,178,.45);
  transition: transform .2s, box-shadow .2s;
}
.btn-stock:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(8,145,178,.55);
}
.btn-stock .btn-shine {
  position: absolute; top: 0; left: -75%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.btn-stock:hover .btn-shine { left: 130%; }

/* BTN ADD */
.btn-add {
  position: relative;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 11px 22px; border-radius: 13px;
  font-size: .9rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; text-decoration: none; cursor: pointer;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(37,99,235,.45);
  transition: transform .2s, box-shadow .2s;
}
.btn-add:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(37,99,235,.55);
}
.add-icon-wrap {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(255,255,255,.2);
  border: 1.5px solid rgba(255,255,255,.3);
  flex-shrink: 0;
}
.add-icon { width: 14px; height: 14px; }
.btn-shine {
  position: absolute; top: 0; left: -75%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.btn-add:hover .btn-shine { left: 130%; }

/* ═══ CONTENT SHELL ═══ */
.content-shell {
  max-width: 1200px; margin: -36px auto 48px;
  padding: 0 24px;
  position: relative; z-index: 10;
  display: flex; flex-direction: column; gap: 20px;
}

/* SEARCH WRAP */
.search-wrap {
  background: white; border-radius: 20px; padding: 18px 22px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 20px 60px rgba(10,15,30,.1);
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.result-count {
  display: flex; align-items: center; gap: 8px;
  font-size: .84rem; color: #64748b; font-weight: 500;
  white-space: nowrap;
}
.count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-size: .72rem; font-weight: 800;
  padding: 2px 10px; border-radius: 999px;
}

/* ═══ PRODUCT SCROLL ═══ */
.product-scroll {
  display: flex; gap: 14px;
  overflow-x: auto;
  padding: 4px 4px 16px;
  scroll-snap-type: x mandatory;
  cursor: grab;
}
.product-scroll.dragging { cursor: grabbing; }
.product-scroll::-webkit-scrollbar { height: 5px; }
.product-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
.product-scroll::-webkit-scrollbar-thumb { background: rgba(37,99,235,.4); border-radius: 3px; }

/* ═══ MINI CARD ═══ */
.mini-card {
  position: relative;
  flex: 0 0 148px;
  background: white;
  border-radius: 20px;
  padding: 12px 12px 14px;
  text-align: left;
  cursor: pointer;
  border: 1.5px solid #e8edf8;
  scroll-snap-align: start;
  box-shadow: 0 8px 24px rgba(10,15,30,.07);
  transition: transform .25s, box-shadow .25s, border-color .25s;
  display: flex; flex-direction: column; gap: 6px;
}
.mini-card:hover {
  transform: translateY(-7px) scale(1.02);
  box-shadow: 0 20px 44px rgba(37,99,235,.16);
  border-color: #a5b4fc;
}
.img-wrap {
  overflow: hidden; border-radius: 14px;
  background: #f8faff;
}
.mini-img {
  width: 100%; height: 148px;
  object-fit: cover; display: block;
  transition: transform .35s;
}
.mini-card:hover .mini-img { transform: scale(1.06); }
.mini-body { display: flex; flex-direction: column; gap: 3px; }
.mini-brand {
  font-size: .65rem; font-weight: 800; color: #4f46e5;
  text-transform: uppercase; letter-spacing: .07em; margin: 0;
}
.mini-name {
  font-size: .78rem; font-weight: 700;
  color: #0f172a; line-height: 1.25;
  height: 2.5em; overflow: hidden; margin: 0;
}
.mini-price {
  font-size: .88rem; font-weight: 900; color: #dc2626; margin: 0;
}
.mini-origin-price {
  font-size: .68rem; color: #94a3b8;
  text-decoration: line-through; margin: 0;
}
.mini-stock {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .68rem; font-weight: 600; color: #10b981;
  background: rgba(16,185,129,.08);
  border: 1px solid rgba(16,185,129,.15);
  padding: 2px 8px; border-radius: 999px;
  width: fit-content; margin-top: 2px;
}
.mini-stock.out-stock { color: #94a3b8; background: #f1f5f9; border-color: #e2e8f0; }
.stock-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 5px #10b981;
  animation: blink 2s ease-in-out infinite; flex-shrink: 0;
}
.stock-dot.out { background: #94a3b8; box-shadow: none; animation: none; }
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}

/* BADGES */
.badge {
  position: absolute; top: 10px; left: 10px; z-index: 3;
  font-size: .6rem; font-weight: 800;
  padding: 3px 9px; border-radius: 999px; color: white; letter-spacing: .04em;
}
.badge-sale { background: linear-gradient(135deg, #e11d48, #f97316); box-shadow: 0 2px 8px rgba(225,29,72,.35); }
.badge-out  { background: #94a3b8; }

/* EMPTY */
.empty-state {
  text-align: center; color: #94a3b8;
  font-size: .9rem; padding: 60px 0;
  background: white; border-radius: 20px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.07);
}
.empty-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 640px) {
  .hero-banner   { padding-bottom: 56px; }
  .hero-content  { padding: 20px 14px 0; }
  .content-shell { padding: 0 14px; margin-top: -24px; }
  .toolbar-actions { width: 100%; }
  .btn-add, .btn-stock, .btn-refresh { flex: 1; justify-content: center; }
  .hero-title { font-size: 1.3rem; }
}
</style>