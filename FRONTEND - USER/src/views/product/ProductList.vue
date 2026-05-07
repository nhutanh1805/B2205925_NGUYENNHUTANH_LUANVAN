<template>
  <div class="products-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Cửa hàng chính hãng
        </div>

        <h1 class="hero-title">Phụ kiện<br/><em>điện thoại</em></h1>

        <p class="hero-sub">Ốp lưng · Cáp sạc · Tai nghe · Sạc nhanh</p>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">{{ totalProducts }}</span>
            <span class="stat-lbl">Sản phẩm</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">100%</span>
            <span class="stat-lbl">Chính hãng</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">VN</span>
            <span class="stat-lbl">Thị trường</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <!-- Search -->
      <div class="search-wrap">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <InputSearch v-model="searchText" @submit="onSearch" class="search-input-inner" />
        </div>
        <div class="result-pill">
          <span class="result-num">{{ totalProducts }}</span> sản phẩm
        </div>
      </div>

      <!-- Filter danh mục + Sort -->
      <div class="filter-bar">
        <!-- Danh mục -->
        <div class="category-wrap">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="cat-btn"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </div>

        <div class="sort-wrap">
          <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M7 12h10M11 18h2"/>
          </svg>
          <select v-model="sortOption" @change="onSortChange" class="sort-select">
            <option value="createdAt-desc">Mới nhất</option>
            <option value="price-asc">Giá: Thấp → Cao</option>
            <option value="price-desc">Giá: Cao → Thấp</option>
            <option value="sold-desc">Bán chạy nhất</option>
          </select>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="products.length" class="product-grid">
        <div
          v-for="(product, idx) in products"
          :key="product._id"
          class="pcard"
          :style="`--delay:${idx * 0.04}s`"
        >
          <span v-if="product.salePrice" class="pbadge pbadge-sale">
            -{{ calcDiscount(product) }}%
          </span>
          <span v-else-if="product.stock === 0" class="pbadge pbadge-out">Hết</span>

          <div class="pcard-img-wrap" @click="goDetail(product._id)">
            <img :src="product.images?.[0] || placeholder" class="pcard-img" loading="lazy" />
            <div class="pcard-img-overlay"></div>
          </div>

          <div class="pcard-body">
            <p class="pcard-brand">{{ product.brand }}</p>
            <h4 class="pcard-name" @click="goDetail(product._id)">{{ product.name }}</h4>

            <div class="pcard-price-row">
              <span class="pcard-price">{{ formatPrice(product.salePrice || product.price) }}₫</span>
              <span v-if="product.salePrice" class="pcard-origin">{{ formatPrice(product.price) }}₫</span>
            </div>

            <div class="pcard-stock-row">
              <span class="stock-indicator" :class="{ out: product.stock === 0 }"></span>
              <span class="stock-txt" :class="{ out: product.stock === 0 }">
                {{ product.stock === 0 ? 'Hết hàng' : `Còn ${product.stock}` }}
              </span>
            </div>

            <button
              class="pcard-btn"
              :class="{ disabled: product.stock === 0 }"
              :disabled="product.stock === 0"
              @click.stop="confirmAddToCart(product)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="cart-icon">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
              <span class="btn-shine"></span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>Không tìm thấy sản phẩm nào phù hợp</p>
      </div>

    </div>

    <!-- ══ CONFIRM MODAL ══ -->
    <Transition name="modal">
      <div v-if="showConfirm" class="modal-backdrop" @click.self="cancelAdd">
        <div class="modal-card">
          <div class="modal-product-img">
            <img :src="pendingProduct?.images?.[0] || placeholder" />
          </div>
          <div class="modal-body">
            <h3 class="modal-title">Thêm vào giỏ hàng?</h3>
            <p class="modal-desc"><strong>{{ pendingProduct?.name }}</strong></p>
            <p class="modal-price">{{ formatPrice(pendingProduct?.salePrice || pendingProduct?.price) }}₫</p>
            <div class="modal-actions">
              <button class="modal-cancel" @click="cancelAdd">Hủy</button>
              <button class="modal-confirm" @click="executeAddToCart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="cart-icon-sm">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Có, thêm ngay!
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ TOAST ══ -->
    <Transition name="toast">
      <div v-if="showToast" class="toast">
        <div class="toast-icon">✓</div>
        <div class="toast-text">
          <span class="toast-title">Đã thêm vào giỏ</span>
          <span class="toast-name">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import CartService from "@/services/cart.service";
import InputSearch from "@/components/InputSearch.vue";

const router = useRouter();

const products    = ref([]);
const totalProducts = ref(0);
const searchText  = ref("");
const selectedCategory = ref("");
const placeholder = "https://via.placeholder.com/200x260?text=No+Image";
const showConfirm = ref(false);
const pendingProduct = ref(null);
const showToast   = ref(false);
const toastMessage = ref("");

// Sort: giá trị = "sortBy-sortOrder"
const sortOption  = ref("createdAt-desc");

const categories = [
  { value: "", label: "Tất cả" },
  { value: "tai_nghe", label: "Tai nghe" },
  { value: "cap_sac", label: "Cáp sạc" },
  { value: "cu_sac", label: "Củ sạc" },
  { value: "sac_khong_day", label: "Sạc không dây" },
  { value: "pin_du_phong", label: "Pin dự phòng" },
  { value: "kinh_cuong_luc", label: "Kính cường lực" },
  { value: "op_lung", label: "Ốp lưng" },
];

// Tách "price-asc" → sortBy="price", sortOrder="asc"
const buildParams = () => {
  const [sortBy, sortOrder] = sortOption.value.split("-");
  return {
    page: 1,
    limit: 999,
    search: searchText.value || undefined,
    category: selectedCategory.value || undefined,
    sortBy,
    sortOrder,
  };
};

const refreshList = async () => {
  const res = await ProductService.getAll(buildParams());
  products.value = res.products || res;
  totalProducts.value = res.pagination?.total ?? products.value.length;
};

// Khi bấm danh mục → reset về trang 1 → gọi lại
const selectCategory = (val) => {
  selectedCategory.value = val;
  refreshList();
};

// Khi thay sort → gọi lại
const onSortChange = () => refreshList();

// Khi search → gọi lại
const onSearch = () => refreshList();

onMounted(refreshList);

function goDetail(id) { router.push(`/products/${id}`); }

const formatPrice  = v => new Intl.NumberFormat("vi-VN").format(v);
const calcDiscount = p => p.salePrice ? Math.round(100 - (p.salePrice / p.price) * 100) : 0;

function confirmAddToCart(product) {
  if (product.stock === 0) return;
  pendingProduct.value = product;
  showConfirm.value = true;
}
function cancelAdd() {
  showConfirm.value = false;
  pendingProduct.value = null;
}
async function executeAddToCart() {
  showConfirm.value = false;
  try {
    await CartService.addToCart(pendingProduct.value._id, 1);
    toastMessage.value = pendingProduct.value.name;
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 3500);
  } catch {
    alert("Thêm vào giỏ hàng thất bại!");
  }
  pendingProduct.value = null;
}
</script>

<style scoped>
.products-page {
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
  font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 900; color: white;
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
  max-width: 1400px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* ══ SEARCH ══ */
.search-wrap {
  display: flex; align-items: center; gap: 14px;
  background: white; border-radius: 20px; padding: 16px 20px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  margin-bottom: 16px; border: 1px solid rgba(37,99,235,.1);
}
.search-box { flex: 1; display: flex; align-items: center; gap: 10px; }
.search-icon { width: 18px; height: 18px; color: #94a3b8; flex-shrink: 0; }
.search-input-inner { flex: 1; border: none; outline: none; font-size: .95rem; background: transparent; }
.result-pill {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .8rem; font-weight: 700;
  padding: 6px 16px; border-radius: 999px; white-space: nowrap;
}
.result-num { font-size: 1rem; }

/* ══ FILTER BAR ══ */
.filter-bar {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap;
  gap: 12px; margin-bottom: 24px;
}

/* ══ CATEGORY ══ */
.category-wrap { display: flex; gap: 10px; flex-wrap: wrap; }
.cat-btn {
  padding: 8px 18px; border-radius: 999px;
  border: 1.5px solid #e0e7ff; background: white;
  color: #4f46e5; font-weight: 600; font-size: .85rem;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 2px 8px rgba(37,99,235,.06);
}
.cat-btn:hover { background: #eff6ff; border-color: #a5b4fc; }
.cat-btn.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border-color: transparent;
  box-shadow: 0 4px 12px rgba(37,99,235,.3);
}

.sort-wrap {
  display: flex; align-items: center; gap: 8px;
  background: white; border: 1.5px solid #e0e7ff;
  border-radius: 12px; padding: 8px 14px;
  box-shadow: 0 2px 8px rgba(37,99,235,.06);
  flex-shrink: 0;
}
.sort-icon { width: 16px; height: 16px; color: #4f46e5; flex-shrink: 0; }
.sort-select {
  border: none; outline: none; background: transparent;
  font-size: .85rem; font-weight: 700; color: #4f46e5;
  cursor: pointer; appearance: none;
  padding-right: 4px;
}

/* ══ GRID ══ */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

/* ══ CARD ══ */
.pcard {
  position: relative; background: white;
  border-radius: 22px; overflow: hidden;
  border: 1.5px solid #e8edf8;
  transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s, border-color .3s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pcard:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 50px rgba(37,99,235,.16);
  border-color: #a5b4fc;
}

.pbadge {
  position: absolute; top: 10px; left: 10px; z-index: 3;
  font-size: .62rem; font-weight: 800; padding: 3px 9px;
  border-radius: 999px; color: white; letter-spacing: .04em;
}
.pbadge-sale { background: linear-gradient(135deg, #e11d48, #f97316); box-shadow: 0 3px 10px rgba(225,29,72,.4); }
.pbadge-out  { background: #94a3b8; }

.pcard-img-wrap { position: relative; overflow: hidden; cursor: pointer; height: 200px; background: #f8faff; }
.pcard-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
.pcard:hover .pcard-img { transform: scale(1.08); }
.pcard-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(10,15,30,.06));
}

.pcard-body { padding: 14px 14px 16px; }
.pcard-brand { font-size: .68rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
.pcard-name { font-size: .88rem; font-weight: 700; color: #0f172a; height: 2.6em; overflow: hidden; line-height: 1.3; cursor: pointer; margin-bottom: 10px; transition: color .2s; }
.pcard-name:hover { color: #2563eb; }
.pcard-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; }
.pcard-price { font-size: 1rem; font-weight: 800; color: #e11d48; }
.pcard-origin { font-size: .75rem; color: #cbd5e1; text-decoration: line-through; }
.pcard-stock-row { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.stock-indicator { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; animation: blink 2s ease-in-out infinite; }
.stock-indicator.out { background: #cbd5e1; box-shadow: none; animation: none; }
.stock-txt { font-size: .72rem; font-weight: 600; color: #10b981; }
.stock-txt.out { color: #94a3b8; }

.pcard-btn {
  width: 100%; padding: 10px 8px; border-radius: 13px;
  font-size: .82rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: transform .2s, box-shadow .2s;
}
.pcard-btn:hover:not(.disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.pcard-btn.disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
.cart-icon { width: 15px; height: 15px; flex-shrink: 0; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.pcard-btn:hover:not(.disabled) .btn-shine { left: 130%; }

.empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; font-size: 1rem; }
.empty-icon { font-size: 3rem; margin-bottom: 12px; display: block; }

/* ══ MODAL ══ */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(10,15,30,.65); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card { background: white; border-radius: 24px; overflow: hidden; max-width: 380px; width: 100%; box-shadow: 0 30px 70px rgba(0,0,0,.25); display: flex; flex-direction: column; }
.modal-product-img { height: 200px; background: #f8faff; overflow: hidden; }
.modal-product-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.modal-body { padding: 24px; }
.modal-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.modal-desc { font-size: .9rem; color: #475569; margin-bottom: 4px; }
.modal-price { font-size: 1.3rem; font-weight: 800; color: #e11d48; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 10px; }
.modal-cancel { flex: 1; padding: 12px; border-radius: 12px; background: #f1f5f9; color: #475569; font-weight: 700; border: none; cursor: pointer; transition: background .2s; }
.modal-cancel:hover { background: #e2e8f0; }
.modal-confirm { flex: 2; padding: 12px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(37,99,235,.35); transition: all .2s; }
.modal-confirm:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.45); }
.cart-icon-sm { width: 15px; height: 15px; }
.modal-enter-active, .modal-leave-active { transition: opacity .25s, transform .25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card { transform: scale(.92) translateY(20px); }

/* ══ TOAST ══ */
.toast { position: fixed; top: 24px; right: 24px; z-index: 200; background: #0a0f1e; color: white; border-radius: 16px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 12px 40px rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.08); min-width: 260px; }
.toast-icon { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: .9rem; font-weight: 900; flex-shrink: 0; box-shadow: 0 4px 12px rgba(16,185,129,.4); }
.toast-text { display: flex; flex-direction: column; gap: 2px; }
.toast-title { font-size: .75rem; font-weight: 700; color: #10b981; letter-spacing: .04em; text-transform: uppercase; }
.toast-name { font-size: .88rem; color: rgba(255,255,255,.85); font-weight: 500; }
.toast-enter-active { animation: toastSlide .4s cubic-bezier(.175,.885,.32,1.275); }
.toast-leave-active { animation: toastSlide .3s ease reverse; }
@keyframes toastSlide {
  from { opacity: 0; transform: translateX(40px) scale(.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .hero-stats { gap: 16px; padding: 14px 20px; }
  .main-panel { padding: 0 14px 40px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .sort-wrap { justify-content: center; }
  .category-wrap { gap: 8px; }
  .cat-btn { padding: 6px 14px; font-size: .78rem; }
}
</style>