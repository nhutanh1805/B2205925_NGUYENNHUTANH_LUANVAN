<template>
  <div v-if="product" class="page">

    <!-- ── ADMIN TOOLBAR ── -->
    <div class="admin-toolbar">
      <button class="btn-back" @click="router.push('/products')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        Quay lại
      </button>

      <div class="toolbar-actions">
        <router-link :to="`/products/edit/${product._id}`" class="btn-edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Sửa sản phẩm
        </router-link>

        <button class="btn-delete" @click="confirmDelete" :disabled="isDeleting">
          <svg v-if="!isDeleting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <span v-if="isDeleting" class="spinner-sm"></span>
          {{ isDeleting ? 'Đang xóa…' : 'Xóa sản phẩm' }}
        </button>
      </div>
    </div>

    <!-- ── CONFIRM MODAL ── -->
    <Transition name="modal">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-box">
          <div class="modal-icon">🗑️</div>
          <h3 class="modal-title">Xóa sản phẩm?</h3>
          <p class="modal-desc">
            Hành động này sẽ gỡ <strong>{{ product.name }}</strong> khỏi hệ thống.
            Không thể hoàn tác.
          </p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="showConfirm = false">Hủy</button>
            <button class="modal-confirm" @click="deleteProduct">Xác nhận xóa</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── MAIN LAYOUT ── -->
    <div class="product-layout">

      <!-- LEFT: GALLERY -->
      <div class="product-gallery">
        <div class="main-image">
          <Transition name="fade" mode="out-in">
            <img :src="currentImage" :key="currentImage" />
          </Transition>
          <span v-if="product.salePrice" class="img-badge sale-badge">
            -{{ discountPercent }}%
          </span>
          <span v-else-if="product.stock === 0" class="img-badge out-badge">
            Hết hàng
          </span>
        </div>

        <div class="thumb-list" v-if="product.images?.length > 1">
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

      <!-- RIGHT: BUYBOX -->
      <div class="buybox">

        <div class="product-meta">
          <span class="meta-brand">{{ product.brand }}</span>
          <span class="meta-dot">·</span>
          <span class="meta-category">{{ product.category }}</span>
        </div>

        <h1 class="title">{{ product.name }}</h1>

        <!-- PRICE -->
        <div class="price-box">
          <span class="sale-price">
            {{ formatPrice(product.salePrice || product.price) }}₫
          </span>
          <span v-if="product.salePrice" class="origin-price">
            {{ formatPrice(product.price) }}₫
          </span>
          <span v-if="product.salePrice" class="discount-tag">
            Tiết kiệm {{ formatPrice(product.price - product.salePrice) }}₫
          </span>
        </div>

        <!-- STOCK -->
        <div class="stock-row">
          <span class="stock-dot" :class="{ out: product.stock === 0 }"></span>
          <span class="stock-text" :class="{ out: product.stock === 0 }">
            {{ product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng' }}
          </span>
        </div>

        <!-- MINI SPECS -->
        <div class="specs-mini">
          <div class="spec-item">
            <span class="spec-label">Thương hiệu</span>
            <b class="spec-val">{{ product.brand }}</b>
          </div>
          <div class="spec-item">
            <span class="spec-label">Danh mục</span>
            <b class="spec-val">{{ product.category }}</b>
          </div>
          <div class="spec-item">
            <span class="spec-label">Xuất xứ</span>
            <b class="spec-val">{{ product.origin }}</b>
          </div>
          <div class="spec-item">
            <span class="spec-label">Bảo hành</span>
            <b class="spec-val">{{ product.warrantyMonths }} tháng</b>
          </div>
        </div>

        <!-- BUY ACTIONS -->
        <div class="buy-actions">
          <button class="btn-cart" :disabled="product.stock === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Thêm vào giỏ
          </button>
          <button class="btn-buy" :disabled="product.stock === 0">
            Mua ngay
          </button>
        </div>

      </div>
    </div>

    <!-- ── SPEC TABLE ── -->
    <div v-if="specEntries.length" class="spec-table">
      <h2 class="spec-title">Thông số kỹ thuật</h2>
      <div class="spec-grid">
        <div
          v-for="([key, value]) in specEntries"
          :key="key"
          class="spec-row"
        >
          <span class="spec-row-key">{{ formatKey(key) }}</span>
          <b class="spec-row-val">{{ value }}</b>
        </div>
      </div>
    </div>

  </div>

  <!-- LOADING -->
  <div v-else class="loading-screen">
    <div class="spinner"></div>
    <p>Đang tải sản phẩm…</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const currentImage = ref("");
const isDeleting = ref(false);
const showConfirm = ref(false);

/* ── COMPUTED ── */
const discountPercent = computed(() => {
  if (!product.value?.salePrice) return 0;
  return Math.round(100 - (product.value.salePrice / product.value.price) * 100);
});

const specEntries = computed(() => {
  if (!product.value?.specs) return [];
  return Object.entries(product.value.specs).filter(([, v]) => v);
});

/* ── HELPERS ── */
const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v);

const formatKey = k =>
  k.replace(/_/g, " ")
   .replace(/([A-Z])/g, " $1")
   .replace(/^./, s => s.toUpperCase());

/* ── DELETE ── */
function confirmDelete() {
  showConfirm.value = true;
}

async function deleteProduct() {
  showConfirm.value = false;
  isDeleting.value = true;
  try {
    await ProductService.delete(product.value._id);
    router.push("/products");
  } catch (e) {
    alert("Xóa thất bại: " + (e.message || "Lỗi không xác định"));
  } finally {
    isDeleting.value = false;
  }
}

/* ── LOAD ── */
onMounted(async () => {
  const res = await ProductService.get(route.params.id);
  product.value = res;
  currentImage.value = res.images?.length
    ? res.images[0]
    : "https://via.placeholder.com/600x400";
});
</script>

<style scoped>
/* ── BASE ── */
.page {
  max-width: 1200px;
  margin: auto;
  padding: 24px 30px 60px;
}

/* ── ADMIN TOOLBAR ── */
.admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
  padding: 14px 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: .85rem;
  font-weight: 600;
  color: #475569;
  background: white;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all .2s;
}
.btn-back svg { width: 16px; height: 16px; }
.btn-back:hover { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }

.toolbar-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* Edit button */
.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 11px;
  font-size: .88rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37,99,235,.3);
  transition: transform .2s, box-shadow .2s;
}
.btn-edit svg { width: 15px; height: 15px; }
.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37,99,235,.4);
}
.btn-edit:active { transform: translateY(0); }

/* Delete button */
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 11px;
  font-size: .88rem;
  font-weight: 700;
  color: #dc2626;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  cursor: pointer;
  transition: all .2s;
}
.btn-delete svg { width: 15px; height: 15px; }
.btn-delete:hover:not(:disabled) {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
  box-shadow: 0 4px 14px rgba(220,38,38,.3);
  transform: translateY(-2px);
}
.btn-delete:disabled { opacity: .6; cursor: not-allowed; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-box {
  background: white;
  border-radius: 20px;
  padding: 36px 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,.2);
}
.modal-icon { font-size: 2.5rem; margin-bottom: 12px; }
.modal-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.modal-desc { font-size: .9rem; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
.modal-actions { display: flex; gap: 12px; }
.modal-cancel {
  flex: 1; padding: 11px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  border: none; cursor: pointer;
  transition: background .2s;
}
.modal-cancel:hover { background: #e2e8f0; }
.modal-confirm {
  flex: 1; padding: 11px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  font-weight: 700;
  border: none; cursor: pointer;
  box-shadow: 0 4px 12px rgba(220,38,38,.35);
  transition: all .2s;
}
.modal-confirm:hover {
  box-shadow: 0 6px 18px rgba(220,38,38,.45);
  transform: translateY(-1px);
}

/* modal transitions */
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }

/* ── LAYOUT ── */
.product-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  align-items: start;
}

/* ── GALLERY ── */
.product-gallery { display: flex; flex-direction: column; gap: 14px; }

.main-image {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  background: #fafbff;
}
.main-image img {
  width: 100%;
  height: 460px;
  object-fit: contain;
  display: block;
}

.img-badge {
  position: absolute;
  top: 14px; left: 14px;
  font-size: .75rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
  color: white;
  letter-spacing: .04em;
}
.sale-badge  { background: linear-gradient(135deg, #ef4444, #f97316); box-shadow: 0 3px 10px rgba(239,68,68,.4); }
.out-badge   { background: #94a3b8; }

.thumb-list { display: flex; gap: 10px; flex-wrap: wrap; }
.thumb {
  width: 70px; height: 70px;
  border: 2px solid transparent;
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color .2s, transform .2s;
}
.thumb:hover { transform: scale(1.05); }
.thumb.active { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

/* fade transition for image swap */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── BUYBOX ── */
.buybox {
  border: 1px solid #e5e7eb;
  padding: 28px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,.05);
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.meta-brand { font-size: .78rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: .06em; }
.meta-dot   { color: #cbd5e1; }
.meta-category { font-size: .78rem; color: #94a3b8; }

.title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
  margin-bottom: 18px;
}

/* PRICE */
.price-box {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}
.sale-price {
  font-size: 2rem;
  font-weight: 800;
  color: #dc2626;
  line-height: 1;
}
.origin-price {
  font-size: 1rem;
  color: #94a3b8;
  text-decoration: line-through;
}
.discount-tag {
  font-size: .75rem;
  font-weight: 700;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 3px 10px;
  border-radius: 999px;
}

/* STOCK */
.stock-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.stock-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
  animation: pulse-dot 1.8s ease-in-out infinite;
}
.stock-dot.out { background: #94a3b8; box-shadow: none; animation: none; }
.stock-text { font-size: .88rem; font-weight: 600; color: #16a34a; }
.stock-text.out { color: #94a3b8; }
@keyframes pulse-dot {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .5; transform: scale(1.4); }
}

/* MINI SPECS */
.specs-mini {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}
.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fafbff;
  border-bottom: 1px solid #f1f5f9;
}
.spec-item:last-child { border-bottom: none; }
.spec-item:nth-child(even) { background: white; }
.spec-label { font-size: .82rem; color: #64748b; }
.spec-val   { font-size: .88rem; font-weight: 700; color: #0f172a; }

/* BUY ACTIONS */
.buy-actions {
  display: flex;
  gap: 12px;
}
.btn-cart, .btn-buy {
  flex: 1;
  padding: 13px 12px;
  border-radius: 12px;
  font-size: .92rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all .2s;
}
.btn-cart svg { width: 17px; height: 17px; }
.btn-cart {
  background: #eff6ff;
  color: #2563eb;
  border: 1.5px solid #bfdbfe;
}
.btn-cart:hover:not(:disabled) {
  background: #dbeafe;
  border-color: #93c5fd;
  transform: translateY(-2px);
}
.btn-buy {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  box-shadow: 0 4px 14px rgba(22,163,74,.3);
}
.btn-buy:hover:not(:disabled) {
  box-shadow: 0 8px 22px rgba(22,163,74,.4);
  transform: translateY(-2px);
}
.btn-cart:disabled, .btn-buy:disabled { opacity: .45; cursor: not-allowed; transform: none; }

/* ── SPEC TABLE ── */
.spec-table {
  margin-top: 50px;
  background: white;
  padding: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,.04);
}
.spec-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #f1f5f9;
}
.spec-grid { display: flex; flex-direction: column; gap: 0; }
.spec-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 14px;
  border-radius: 8px;
  transition: background .15s;
}
.spec-row:hover { background: #f8fafc; }
.spec-row:not(:last-child) { border-bottom: 1px solid #f3f4f6; }
.spec-row-key { font-size: .87rem; color: #64748b; }
.spec-row-val { font-size: .9rem; font-weight: 700; color: #1e293b; text-align: right; max-width: 55%; }

/* ── LOADING ── */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 16px;
  color: #94a3b8;
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(220,38,38,.3);
  border-top-color: #dc2626;
  border-radius: 50%;
  display: inline-block;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── MOBILE ── */
@media (max-width: 900px) {
  .product-layout { grid-template-columns: 1fr; }
  .main-image img { height: 320px; }
  .admin-toolbar { flex-direction: column; align-items: stretch; }
  .toolbar-actions { justify-content: stretch; }
  .btn-edit, .btn-delete { flex: 1; justify-content: center; }
}
</style>