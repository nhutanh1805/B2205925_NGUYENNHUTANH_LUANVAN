<template>
  <div class="products-page min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
    <div class="container mx-auto max-w-7xl px-4">

      <!-- HERO -->
      <div class="hero-box relative overflow-hidden text-white mb-10 rounded-3xl shadow-2xl">
        <div class="hero-bg"></div>
        <div class="hero-particles">
          <span v-for="i in 8" :key="i" class="particle" :style="`--i:${i}`"></span>
        </div>

        <div class="relative z-10 py-14 px-6 text-center">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            Hệ thống đang hoạt động
          </div>

          <h1 class="text-5xl font-extrabold mb-4 tracking-tight hero-title">
            Quản lý cửa hàng điện thoại
          </h1>

          <p class="text-xl opacity-90 mb-8">
            iPhone • Samsung • Xiaomi • Chính hãng • Giá tốt
          </p>

          <div class="hero-stats">
            <div class="hero-stat">
              <span class="stat-number">{{ products.length }}</span>
              <span class="stat-label">Sản phẩm</span>
            </div>
            <div class="hero-stat">
              <span class="stat-number">100%</span>
              <span class="stat-label">Chính hãng</span>
            </div>
            <div class="hero-stat">
              <span class="stat-number">VN</span>
              <span class="stat-label">Thị trường</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN CARD -->
      <div class="main-card bg-white rounded-3xl shadow-xl p-6">

        <InputSearch
          v-model="searchText"
          @submit="refreshList"
          class="mb-6"
        />

        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold text-blue-600">
            Danh sách sản phẩm
            <span class="count-badge">{{ filteredProductsCount }}</span>
          </h3>
        </div>

        <!-- PRODUCT SCROLL -->
        <div v-if="filteredProductsCount" class="product-scroll" ref="scrollEl">
          <div
            v-for="product in filteredProducts"
            :key="product._id"
            class="mini-card"
            @click="goDetail(product._id)"
          >
            <span v-if="product.salePrice" class="badge badge-sale">SALE</span>
            <span v-else-if="product.stock === 0" class="badge badge-out">HẾT</span>

            <div class="img-wrap">
              <img
                :src="product.images?.[0] || placeholder"
                class="mini-img"
                loading="lazy"
              />
            </div>

            <h4 class="mini-name">{{ product.name }}</h4>

            <p class="mini-price">
              {{ formatPrice(product.salePrice || product.price) }}₫
            </p>

            <span class="mini-stock" :class="{ 'out-stock': product.stock === 0 }">
              {{ product.stock === 0 ? 'Hết hàng' : `Còn ${product.stock} máy` }}
            </span>
          </div>
        </div>

        <p v-else class="text-center text-gray-400 italic py-16 empty-state">
          <span class="empty-icon">🔍</span><br/>
          Không có sản phẩm phù hợp
        </p>

        <!-- ACTION BUTTONS -->
        <div class="action-bar">
          <button class="btn-refresh" @click="refreshList" :class="{ spinning: isRefreshing }">
            <svg class="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Làm mới
          </button>

          <router-link to="/products/add" class="btn-add">
            <span class="add-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" class="add-icon">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </span>
            <span class="add-text">Thêm sản phẩm mới</span>
            <span class="add-shine"></span>
          </router-link>
        </div>

      </div>
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

const productStrings = computed(() =>
  products.value.map(p =>
    `${p.name}${p.brand}${p.imei || ""}`.toLowerCase()
  )
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
    el.addEventListener(ev, () => {
      isDown = false;
      el.classList.remove("dragging");
    })
  );

  el.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX) * 1.3;
  });
}
</script>

<style scoped>
/* ── HERO ── */
.hero-box {
  background: linear-gradient(135deg, #1e40af, #4f46e5, #7c3aed);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 25%, rgba(255,255,255,.18), transparent 40%),
    radial-gradient(circle at 85% 10%, rgba(255,255,255,.15), transparent 35%),
    radial-gradient(circle at 50% 110%, rgba(0,0,0,.25), transparent 55%);
  filter: blur(18px);
}

/* floating particles */
.hero-particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.particle {
  position: absolute;
  width: calc(4px + var(--i) * 3px);
  height: calc(4px + var(--i) * 3px);
  border-radius: 50%;
  background: rgba(255,255,255, calc(.08 + var(--i) * .03));
  top: calc(var(--i) * 11%);
  left: calc(var(--i) * 12%);
  animation: drift calc(6s + var(--i) * 1.5s) ease-in-out infinite alternate;
}
@keyframes drift {
  from { transform: translateY(0) rotate(0deg); }
  to   { transform: translateY(-20px) rotate(180deg); }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.3);
  border-radius: 999px;
  padding: 4px 14px;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .06em;
  margin-bottom: 16px;
  backdrop-filter: blur(8px);
}
.badge-dot {
  width: 7px; height: 7px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 6px #4ade80;
  animation: pulse-dot 1.6s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .6; transform: scale(1.4); }
}

.hero-title {
  text-shadow: 0 2px 20px rgba(0,0,0,.25);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-stat {
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,.13);
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 16px;
  padding: 14px 22px;
  min-width: 100px;
  transition: transform .2s;
}
.hero-stat:hover { transform: translateY(-3px); }

.stat-number { display: block; font-size: 1.7rem; font-weight: 800; line-height: 1.1; }
.stat-label  { font-size: .72rem; opacity: .85; letter-spacing: .06em; text-transform: uppercase; }

/* ── MAIN CARD ── */
.main-card {
  border: 1px solid #e8edf5;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: .75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  vertical-align: middle;
}

/* ── PRODUCT SCROLL ── */
.product-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 8px 4px 16px;
  scroll-snap-type: x mandatory;
  cursor: grab;
}
.product-scroll.dragging { cursor: grabbing; }
.product-scroll::-webkit-scrollbar { height: 5px; }
.product-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
.product-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.45); border-radius: 3px; }

/* ── MINI CARD ── */
.mini-card {
  position: relative;
  flex: 0 0 140px;
  background: #fafbff;
  border-radius: 18px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border: 1.5px solid #e5e7f5;
  scroll-snap-align: start;
  transition: transform .25s, box-shadow .25s, border-color .25s;
}
.mini-card:hover {
  transform: translateY(-7px) scale(1.02);
  box-shadow: 0 16px 36px rgba(99,102,241,.18);
  border-color: #a5b4fc;
}

.img-wrap {
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 8px;
}
.mini-img {
  width: 112px;
  height: 150px;
  object-fit: cover;
  display: block;
  transition: transform .3s;
}
.mini-card:hover .mini-img { transform: scale(1.07); }

.mini-name {
  font-size: .78rem;
  font-weight: 700;
  height: 2.4em;
  overflow: hidden;
  color: #1e293b;
  line-height: 1.2;
}

.mini-price {
  font-size: .85rem;
  font-weight: 800;
  color: #dc2626;
  margin: 3px 0;
}

.mini-stock {
  font-size: .68rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 999px;
  display: inline-block;
}
.mini-stock.out-stock {
  color: #9ca3af;
  background: #f3f4f6;
}

/* badges */
.badge {
  position: absolute;
  top: 8px; left: 8px;
  font-size: .62rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  color: white;
  letter-spacing: .04em;
  z-index: 1;
}
.badge-sale { background: linear-gradient(135deg, #ef4444, #f97316); box-shadow: 0 2px 8px rgba(239,68,68,.4); }
.badge-out  { background: #9ca3af; }

/* ── EMPTY STATE ── */
.empty-state { color: #94a3b8; }
.empty-icon  { font-size: 2.5rem; display: block; margin-bottom: 10px; }

/* ── ACTION BAR ── */
.action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

/* Refresh button */
.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: .88rem;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all .2s;
}
.btn-refresh:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
  box-shadow: 0 3px 10px rgba(0,0,0,.07);
}
.refresh-icon {
  width: 16px; height: 16px;
  transition: transform .5s;
}
.btn-refresh.spinning .refresh-icon {
  animation: spin .6s linear;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ADD BUTTON ✨ */
.btn-add {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 30px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
  border: none;
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
  letter-spacing: .02em;
  box-shadow:
    0 6px 20px rgba(79,70,229,.4),
    0 2px 6px rgba(79,70,229,.25),
    inset 0 1px 0 rgba(255,255,255,.2);
  transition: transform .2s, box-shadow .2s;
}
.btn-add:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 14px 32px rgba(79,70,229,.5),
    0 4px 10px rgba(79,70,229,.3),
    inset 0 1px 0 rgba(255,255,255,.2);
}
.btn-add:active {
  transform: translateY(-1px) scale(.99);
}

/* Icon circle */
.add-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,.25);
  border: 1.5px solid rgba(255,255,255,.35);
  flex-shrink: 0;
  transition: background .2s;
}
.btn-add:hover .add-icon-wrap {
  background: rgba(255,255,255,.35);
}
.add-icon { width: 16px; height: 16px; }

.add-text { position: relative; z-index: 1; }

/* Shine sweep */
.add-shine {
  position: absolute;
  top: 0; left: -75%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
  transform: skewX(-20deg);
  transition: left .5s;
}
.btn-add:hover .add-shine { left: 125%; }
</style>