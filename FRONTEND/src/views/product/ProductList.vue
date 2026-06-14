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
            <span class="stat-number">{{ totalProducts }}</span>
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

        <!-- TOOLBAR -->
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
            </router-link>

            <router-link to="/products/add" class="btn-add">
              <span class="add-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" class="add-icon">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              Thêm sản phẩm
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ MAIN CONTENT ═══════════ -->
    <div class="content-shell">

      <!-- SEARCH -->
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

      <!-- FILTER BAR -->
      <div class="filter-bar">
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
            <option value="stock-asc">Tồn kho thấp</option>
          </select>
        </div>
      </div>

      <!-- PRODUCT GRID -->
      <div v-if="products.length" class="product-grid">
        <div
          v-for="(product, idx) in products"
          :key="product._id"
          class="pcard"
          :style="`--delay:${idx * 0.03}s`"
          @click="goDetail(product._id)"
        >
          <span v-if="product.salePrice" class="pbadge pbadge-sale">
            -{{ discountOf(product) }}%
          </span>
          <span v-else-if="product.stock === 0" class="pbadge pbadge-out">Hết</span>

          <div class="pcard-img-wrap">
            <img :src="product.images?.[0] || placeholder" class="pcard-img" loading="lazy" />
          </div>

          <div class="pcard-body">
            <p class="pcard-brand">{{ product.brand }}</p>
            <h4 class="pcard-name">{{ product.name }}</h4>

            <div class="pcard-price-row">
              <span class="pcard-price">{{ formatPrice(product.salePrice || product.price) }}₫</span>
              <span v-if="product.salePrice" class="pcard-origin">{{ formatPrice(product.price) }}₫</span>
            </div>

            <div class="pcard-meta">
              <span class="stock-chip" :class="{ out: product.stock === 0 }">
                <span class="stock-dot" :class="{ out: product.stock === 0 }"></span>
                {{ product.stock === 0 ? 'Hết hàng' : `Còn ${product.stock}` }}
              </span>
              <span class="sold-chip">Đã bán {{ product.sold || 0 }}</span>
            </div>

            <button
              class="pcard-btn"
              @click.stop="goEdit(product._id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="edit-icon">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>Không tìm thấy sản phẩm nào phù hợp</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import InputSearch from "@/components/InputSearch.vue";

const router = useRouter();

const products       = ref([]);
const totalProducts  = ref(0);
const searchText     = ref("");
const selectedCategory = ref("");
const isRefreshing   = ref(false);
const sortOption     = ref("createdAt-desc");
const placeholder    = "https://via.placeholder.com/200x260?text=No+Image";

const categories = [
  { value: "",              label: "Tất cả" },
  { value: "tai_nghe",     label: "Tai nghe" },
  { value: "cap_sac",      label: "Cáp sạc" },
  { value: "cu_sac",       label: "Củ sạc" },
  { value: "sac_khong_day",label: "Sạc không dây" },
  { value: "pin_du_phong", label: "Pin dự phòng" },
  { value: "kinh_cuong_luc",label: "Kính cường lực" },
  { value: "op_lung",      label: "Ốp lưng" },
];

const inStockCount = computed(() => products.value.filter(p => p.stock > 0).length);
const onSaleCount  = computed(() => products.value.filter(p => p.salePrice).length);

const buildParams = () => {
  const [sortBy, sortOrder] = sortOption.value.split("-");
  return {
    page: 1, limit: 999,
    search: searchText.value || undefined,
    category: selectedCategory.value || undefined,
    sortBy, sortOrder,
  };
};

const refreshList = async () => {
  isRefreshing.value = true;
  try {
    const res = await ProductService.getAll(buildParams());
    products.value = res.products || res;
    totalProducts.value = res.pagination?.total ?? products.value.length;
  } finally {
    setTimeout(() => { isRefreshing.value = false; }, 600);
  }
};

const selectCategory = (val) => { selectedCategory.value = val; refreshList(); };
const onSortChange   = () => refreshList();
const onSearch       = () => refreshList();

onMounted(refreshList);

const goDetail = (id) => router.push(`/products/${id}`);
const goEdit   = (id) => router.push(`/products/edit/${id}`);

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v);
const discountOf  = p => Math.round(100 - (p.salePrice / p.price) * 100);
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ═══ HERO ═══ */
.hero-banner {
  position: relative; overflow: hidden;
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
  max-width: 1400px; margin: 0 auto;
  padding: 28px 24px 0;
  display: flex; flex-direction: column; gap: 22px;
}

.breadcrumb {
  font-size: .8rem; color: rgba(255,255,255,.45);
  display: flex; align-items: center; gap: 6px;
}
.breadcrumb .sep     { color: rgba(255,255,255,.2); }
.breadcrumb .current { color: rgba(255,255,255,.8); font-weight: 600; }

.hero-stats { display: flex; gap: 14px; flex-wrap: wrap; }
.hero-stat {
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 16px; padding: 12px 20px; min-width: 90px;
  transition: transform .2s;
}
.hero-stat:hover { transform: translateY(-3px); }
.stat-number { display: block; font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1.1; }
.stat-label  { font-size: .68rem; color: rgba(255,255,255,.55); letter-spacing: .07em; text-transform: uppercase; }

.admin-toolbar {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 14px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 18px; padding: 18px 22px;
  backdrop-filter: blur(12px);
}
.toolbar-left { display: flex; flex-direction: column; gap: 8px; }
.hero-title {
  font-size: 1.6rem; font-weight: 800; color: white;
  letter-spacing: -.02em; margin: 0;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18);
  border-radius: 999px; padding: 3px 12px;
  font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.75);
  width: fit-content;
}
.badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4ade80; box-shadow: 0 0 6px #4ade80;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.5; transform:scale(1.5); }
}

.toolbar-actions { display: flex; gap: 10px; flex-wrap: wrap; }

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

.btn-stock {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 11px 20px; border-radius: 13px;
  font-size: .88rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #0891b2, #0e7490);
  border: none; text-decoration: none; cursor: pointer;
  box-shadow: 0 6px 20px rgba(8,145,178,.4);
  transition: transform .2s, box-shadow .2s;
}
.btn-stock:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(8,145,178,.5); }

.btn-add {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 11px 20px; border-radius: 13px;
  font-size: .88rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; text-decoration: none; cursor: pointer;
  box-shadow: 0 6px 20px rgba(37,99,235,.4);
  transition: transform .2s, box-shadow .2s;
}
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(37,99,235,.5); }

.add-icon-wrap {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(255,255,255,.2); border: 1.5px solid rgba(255,255,255,.3);
  flex-shrink: 0;
}
.add-icon { width: 13px; height: 13px; }

/* ═══ CONTENT SHELL ═══ */
.content-shell {
  max-width: 1400px; margin: -36px auto 48px;
  padding: 0 24px;
  position: relative; z-index: 10;
  display: flex; flex-direction: column; gap: 16px;
}

/* ═══ SEARCH ═══ */
.search-wrap {
  display: flex; align-items: center; gap: 14px;
  background: white; border-radius: 20px; padding: 16px 20px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  border: 1px solid rgba(37,99,235,.1);
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

/* ═══ FILTER BAR ═══ */
.filter-bar {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.category-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
.cat-btn {
  padding: 8px 16px; border-radius: 999px;
  border: 1.5px solid #e0e7ff; background: white;
  color: #4f46e5; font-weight: 600; font-size: .82rem;
  cursor: pointer; transition: all .2s;
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
  flex-shrink: 0;
}
.sort-icon { width: 16px; height: 16px; color: #4f46e5; flex-shrink: 0; }
.sort-select {
  border: none; outline: none; background: transparent;
  font-size: .85rem; font-weight: 700; color: #4f46e5;
  cursor: pointer; appearance: none;
}

/* ═══ GRID ═══ */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
}

/* ═══ CARD ═══ */
.pcard {
  position: relative; background: white;
  border-radius: 22px; overflow: hidden;
  border: 1.5px solid #e8edf8; cursor: pointer;
  transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s, border-color .3s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pcard:hover {
  transform: translateY(-7px) scale(1.02);
  box-shadow: 0 24px 50px rgba(37,99,235,.15);
  border-color: #a5b4fc;
}

.pbadge {
  position: absolute; top: 10px; left: 10px; z-index: 3;
  font-size: .6rem; font-weight: 800;
  padding: 3px 9px; border-radius: 999px; color: white;
}
.pbadge-sale { background: linear-gradient(135deg, #e11d48, #f97316); box-shadow: 0 3px 10px rgba(225,29,72,.4); }
.pbadge-out  { background: #94a3b8; }

.pcard-img-wrap { overflow: hidden; height: 180px; background: #f8faff; }
.pcard-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
.pcard:hover .pcard-img { transform: scale(1.07); }

.pcard-body { padding: 13px 14px 15px; display: flex; flex-direction: column; gap: 5px; }
.pcard-brand { font-size: .66rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: .07em; }
.pcard-name  { font-size: .85rem; font-weight: 700; color: #0f172a; height: 2.5em; overflow: hidden; line-height: 1.3; }

.pcard-price-row { display: flex; align-items: baseline; gap: 6px; }
.pcard-price  { font-size: .98rem; font-weight: 800; color: #e11d48; }
.pcard-origin { font-size: .72rem; color: #cbd5e1; text-decoration: line-through; }

.pcard-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stock-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: .68rem; font-weight: 600; color: #10b981;
  background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.15);
  padding: 2px 8px; border-radius: 999px;
}
.stock-chip.out { color: #94a3b8; background: #f1f5f9; border-color: #e2e8f0; }
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
.sold-chip {
  font-size: .66rem; font-weight: 600; color: #6b7280;
  background: #f8faff; border: 1px solid #e8edf8;
  padding: 2px 8px; border-radius: 999px;
}

.pcard-btn {
  margin-top: 4px;
  width: 100%; padding: 9px 8px; border-radius: 11px;
  font-size: .8rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 4px 12px rgba(245,158,11,.3);
  transition: transform .2s, box-shadow .2s;
}
.pcard-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,.4); }
.edit-icon { width: 13px; height: 13px; flex-shrink: 0; }

.empty-state {
  text-align: center; padding: 60px 20px; color: #94a3b8;
  font-size: 1rem; background: white; border-radius: 20px;
  border: 1.5px solid #e8edf8;
}
.empty-icon { font-size: 3rem; margin-bottom: 12px; display: block; }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 640px) {
  .hero-banner   { padding-bottom: 56px; }
  .hero-content  { padding: 20px 14px 0; }
  .content-shell { padding: 0 14px; margin-top: -24px; }
  .toolbar-actions { width: 100%; }
  .btn-add, .btn-stock, .btn-refresh { flex: 1; justify-content: center; }
  .hero-title { font-size: 1.3rem; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .sort-wrap { justify-content: center; }
}
</style>