<template>
  <div v-if="!product" class="loading-screen">
    <div class="spinner"></div>
    <p>Đang tải sản phẩm…</p>
  </div>

  <div v-else class="page">

    <!-- ═══════════ HERO BANNER ═══════════ -->
    <div class="hero-banner">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>

      <div class="hero-content">
        <nav class="breadcrumb">
          <span>Quản trị</span>
          <span class="sep">›</span>
          <span>Sản phẩm</span>
          <span class="sep">›</span>
          <span class="current">{{ product.name }}</span>
        </nav>

        <div class="admin-toolbar">
          <button class="btn-back" @click="router.push('/products')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
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
      </div>
    </div>

    <!-- CONFIRM MODAL (xóa sản phẩm) -->
    <Transition name="modal">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-box">
          <div class="modal-icon-wrap">🗑️</div>
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

    <!-- ═══════════ PRODUCT LAYOUT ═══════════ -->
    <div class="product-shell">

      <div class="gallery-col">
        <div class="main-image-wrap">
          <span v-if="product.salePrice" class="badge-sale">-{{ discountPercent }}%</span>
          <span v-else-if="product.stock === 0" class="badge-out">Hết hàng</span>

          <Transition name="fade" mode="out-in">
            <img :src="currentImage" :key="currentImage" class="main-image" />
          </Transition>
          <div class="image-glow"></div>
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

      <div class="buybox">

        <div class="product-meta">
          <span class="meta-brand">{{ product.brand }}</span>
          <span class="meta-dot">·</span>
          <span class="meta-category">{{ product.category }}</span>
        </div>

        <h1 class="title">{{ product.name }}</h1>

        <div class="price-card">
          <div class="price-inner">
            <span class="price-sale">{{ formatPrice(product.salePrice || product.price) }}₫</span>
            <div class="price-right" v-if="product.salePrice">
              <span class="price-origin">{{ formatPrice(product.price) }}₫</span>
              <span class="price-badge">Tiết kiệm {{ formatPrice(product.price - product.salePrice) }}₫</span>
            </div>
          </div>
        </div>

        <div class="price-editor" v-if="!isEditingPrice">
          <button class="btn-edit-price" @click="openPriceEditor">
            Chỉnh sửa giá
          </button>
        </div>

        <div class="price-editor-form" v-else>
          <div class="price-editor-row">
            <div class="price-editor-field">
              <label>Giá gốc</label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">₫</span>
                <input v-model.number="editPrice" type="number" class="price-input" placeholder="0"/>
              </div>
            </div>
            <div class="price-editor-field">
              <label>Giá khuyến mãi</label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">₫</span>
                <input v-model.number="editSalePrice" type="number" class="price-input" placeholder="Để trống nếu không KM"/>
              </div>
            </div>
          </div>
          <div class="price-editor-actions">
            <button class="btn-price-cancel" @click="isEditingPrice = false">Hủy</button>
            <button class="btn-price-save" @click="savePrice" :disabled="isSavingPrice">
              <span v-if="isSavingPrice" class="spinner-sm"></span>
              {{ isSavingPrice ? 'Đang lưu...' : '✓ Lưu giá' }}
            </button>
          </div>
        </div>

        <div class="stock-row">
          <span class="stock-dot" :class="{ out: product.stock === 0 }"></span>
          <span class="stock-txt" :class="{ out: product.stock === 0 }">
            {{ product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng' }}
          </span>
        </div>

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

        <div class="buy-actions">
          <button class="btn-cart" :disabled="product.stock === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="btn-icon">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Thêm vào giỏ
            <span class="btn-shine"></span>
          </button>
          <button class="btn-buy" :disabled="product.stock === 0">
            ⚡ Mua ngay
          </button>
        </div>

        <div class="admin-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="note-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Chế độ xem trước — hành động mua hàng chỉ hiển thị cho khách.
        </div>

      </div>
    </div>

    <div v-if="specEntries.length" class="spec-block">
      <div class="section-header">
        <h2 class="section-title">Thông số kỹ thuật</h2>
        <div class="section-line"></div>
      </div>

      <div class="spec-grid">
        <div
          v-for="([key, value]) in specEntries"
          :key="key"
          class="spec-row"
        >
          <span class="spec-key">{{ formatKey(key) }}</span>
          <span class="spec-val">{{ value }}</span>
        </div>
      </div>
    </div>

    <!-- ═══════════ LÔ HÀNG TỒN KHO (FIFO) ═══════════ -->
    <div class="batch-block">
      <div class="section-header">
        <h2 class="section-title">Lô hàng tồn kho (FIFO)</h2>
        <div class="section-line"></div>
      </div>

      <div v-if="isLoadingBatches" class="batch-loading">Đang tải lô hàng…</div>

      <div v-else-if="batches.length" class="batch-wrap">
        <div class="batch-summary">
          <div class="batch-summary-item">
            <span class="bs-label">Tổng còn lại</span>
            <b class="bs-value">{{ batchSummary.totalQuantity }} sản phẩm</b>
          </div>
          <div class="batch-summary-item">
            <span class="bs-label">Giá trị tồn kho</span>
            <b class="bs-value bs-money">{{ formatPrice(batchSummary.totalValue) }}₫</b>
          </div>
        </div>

        <table class="batch-table">
          <thead>
            <tr>
              <th>Ngày nhập</th>
              <th>Nhà cung cấp</th>
              <th>Còn lại</th>
              <th>Giá nhập</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in batches" :key="b._id">
              <td>{{ formatDate(b.importedAt) }}</td>
              <td>{{ b.supplierName || "—" }}</td>
              <td><span class="batch-qty">{{ b.quantity }}</span></td>
              <td>{{ formatPrice(b.importPrice) }}₫</td>
              <td class="batch-subtotal">{{ formatPrice(b.subtotal) }}₫</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="batch-empty">Sản phẩm chưa có lô hàng nào còn tồn kho.</div>
    </div>

    <!-- ═══════════ REVIEW MANAGEMENT (đã tách component) ═══════════ -->
    <AdminReviewManager :product-id="product._id" />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import AdminReviewManager from "@/components/AdminReviewManager.vue";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const currentImage = ref("");
const isDeleting = ref(false);
const showConfirm = ref(false);

const isEditingPrice = ref(false);
const isSavingPrice = ref(false);
const editPrice = ref(0);
const editSalePrice = ref(0);

// ─── Lô hàng tồn kho (FIFO) ────────────────────────────
const batches = ref([]);
const batchSummary = ref({ totalQuantity: 0, totalValue: 0 });
const isLoadingBatches = ref(true);

async function fetchBatches(productId) {
  isLoadingBatches.value = true;
  try {
    const res = await fetch(`/api/stock-batches/product/${productId}`);
    const data = await res.json();
    batches.value = data.data || [];
    batchSummary.value = data.summary || { totalQuantity: 0, totalValue: 0 };
  } catch (err) {
    console.error("Lỗi tải lô hàng:", err);
  } finally {
    isLoadingBatches.value = false;
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("vi-VN");
}

const discountPercent = computed(() => {
  if (!product.value?.salePrice) return 0;
  return Math.round(100 - (product.value.salePrice / product.value.price) * 100);
});

const specEntries = computed(() => {
  if (!product.value?.specs) return [];
  return Object.entries(product.value.specs).filter(([, v]) => v);
});

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v);
const formatKey = k =>
  k.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

function confirmDelete() { showConfirm.value = true; }

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

function openPriceEditor() {
  editPrice.value = product.value.price;
  editSalePrice.value = product.value.salePrice || 0;
  isEditingPrice.value = true;
}

async function savePrice() {
  isSavingPrice.value = true;
  try {
    await ProductService.update(product.value._id, {
      ...product.value,
      price: editPrice.value,
      salePrice: editSalePrice.value || null,
    });
    product.value.price = editPrice.value;
    product.value.salePrice = editSalePrice.value || null;
    isEditingPrice.value = false;
  } catch (err) {
    alert(err.response?.data?.message || err.message);
  } finally {
    isSavingPrice.value = false;
  }
}

onMounted(async () => {
  const res = await ProductService.get(route.params.id);
  product.value = res;
  currentImage.value = res.images?.length ? res.images[0] : "https://via.placeholder.com/600x400";
  fetchBatches(res._id);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.hero-banner {
  position: relative; overflow: hidden;
  background: #0a0f1e;
  padding: 0 0 64px;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 10% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 90% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(220,38,38,.06), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 280px; height: 280px; background: rgba(37,99,235,.25); top: -80px; left: -40px; }
.hero-orb-2 { width: 220px; height: 220px; background: rgba(124,58,237,.2); bottom: -50px; right: -30px; }

.hero-content {
  position: relative; z-index: 2;
  max-width: 1200px; margin: 0 auto;
  padding: 28px 24px 0;
  display: flex; flex-direction: column; gap: 20px;
}

.breadcrumb {
  font-size: .8rem; color: rgba(255,255,255,.45);
  display: flex; align-items: center; gap: 6px;
}
.breadcrumb .sep { color: rgba(255,255,255,.2); }
.breadcrumb .current { color: rgba(255,255,255,.8); font-weight: 600; }

.admin-toolbar {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 12px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 18px;
  padding: 14px 20px;
  backdrop-filter: blur(12px);
}

.btn-back {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 11px;
  font-size: .85rem; font-weight: 600;
  color: rgba(255,255,255,.75);
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  cursor: pointer; transition: all .2s;
}
.btn-back svg { width: 16px; height: 16px; }
.btn-back:hover { background: rgba(255,255,255,.14); color: white; }

.toolbar-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.btn-edit {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px;
  font-size: .88rem; font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; text-decoration: none; cursor: pointer;
  box-shadow: 0 4px 16px rgba(37,99,235,.4);
  transition: transform .2s, box-shadow .2s;
}
.btn-edit svg { width: 15px; height: 15px; }
.btn-edit:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.5); }

.btn-delete {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px;
  font-size: .88rem; font-weight: 700;
  color: #fca5a5;
  background: rgba(220,38,38,.15);
  border: 1px solid rgba(220,38,38,.3);
  cursor: pointer; transition: all .2s;
}
.btn-delete svg { width: 15px; height: 15px; }
.btn-delete:hover:not(:disabled) {
  background: rgba(220,38,38,.3);
  color: white;
  border-color: rgba(220,38,38,.5);
  box-shadow: 0 4px 16px rgba(220,38,38,.3);
  transform: translateY(-2px);
}
.btn-delete:disabled { opacity: .5; cursor: not-allowed; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(10,15,30,.7);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: white; border-radius: 24px;
  padding: 36px 32px; max-width: 400px; width: 100%;
  text-align: center;
  box-shadow: 0 30px 70px rgba(0,0,0,.3);
  animation: modalPop .3s cubic-bezier(.175,.885,.32,1.275);
}
@keyframes modalPop { from { opacity:0; transform:scale(.9); } to { opacity:1; transform:scale(1); } }
.modal-icon-wrap { font-size: 2.8rem; margin-bottom: 14px; }
.modal-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.modal-desc { font-size: .9rem; color: #64748b; line-height: 1.7; margin-bottom: 26px; }
.modal-actions { display: flex; gap: 12px; }
.modal-cancel {
  flex: 1; padding: 12px; border-radius: 12px;
  background: #f1f5f9; color: #475569;
  font-weight: 700; border: none; cursor: pointer; transition: background .2s;
}
.modal-cancel:hover { background: #e2e8f0; }
.modal-confirm {
  flex: 1; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white; font-weight: 700; border: none; cursor: pointer;
  box-shadow: 0 4px 14px rgba(220,38,38,.35);
  transition: all .2s;
}
.modal-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(220,38,38,.45); }
.modal-confirm:disabled { opacity: .6; cursor: not-allowed; }
.modal-enter-active, .modal-leave-active { transition: opacity .25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.product-shell {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 32px;
  max-width: 1200px; margin: -32px auto 0;
  padding: 0 24px;
  position: relative; z-index: 10;
}

.gallery-col { display: flex; flex-direction: column; gap: 14px; }

.main-image-wrap {
  position: relative;
  background: white; border-radius: 24px; overflow: hidden;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 20px 60px rgba(10,15,30,.1);
}
.main-image {
  width: 100%; height: 440px;
  object-fit: contain; display: block;
  transition: transform .4s ease;
}
.main-image-wrap:hover .main-image { transform: scale(1.03); }
.image-glow {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 100%, rgba(37,99,235,.05), transparent);
  pointer-events: none;
}

.badge-sale, .badge-out {
  position: absolute; top: 14px; left: 14px; z-index: 3;
  font-size: .7rem; font-weight: 800;
  padding: 4px 12px; border-radius: 999px; color: white; letter-spacing: .04em;
}
.badge-sale { background: linear-gradient(135deg, #e11d48, #f97316); box-shadow: 0 4px 14px rgba(225,29,72,.4); }
.badge-out  { background: #94a3b8; }

.thumb-list { display: flex; gap: 10px; flex-wrap: wrap; }
.thumb {
  width: 72px; height: 72px; cursor: pointer;
  border: 2px solid transparent; border-radius: 14px; overflow: hidden;
  background: white; box-shadow: 0 4px 14px rgba(10,15,30,.08);
  transition: all .2s;
}
.thumb:hover { border-color: #a5b4fc; transform: translateY(-2px); }
.thumb.active { border-color: #2563eb; box-shadow: 0 4px 18px rgba(37,99,235,.3); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.buybox {
  background: white; border-radius: 24px; padding: 28px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 20px 60px rgba(10,15,30,.1);
  display: flex; flex-direction: column; gap: 16px;
}

.product-meta {
  display: flex; align-items: center; gap: 6px;
}
.meta-brand { font-size: .72rem; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: .07em; }
.meta-dot   { color: #cbd5e1; }
.meta-category { font-size: .72rem; color: #94a3b8; }

.title { font-size: 1.6rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0; }

.price-card {
  background: linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 100%);
  border-radius: 18px; padding: 20px 22px;
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

.price-editor { margin-top: -4px; }

.btn-edit-price {
  font-size: .78rem; font-weight: 600; color: #94a3b8;
  background: none; border: 1px dashed #e2e8f0;
  border-radius: 8px; padding: 6px 14px; cursor: pointer;
  transition: all .2s;
}
.btn-edit-price:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

.price-editor-form {
  background: #f8faff; border: 1.5px solid #e0e7ff;
  border-radius: 16px; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.price-editor-row { display: flex; gap: 12px; }
.price-editor-field { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.price-editor-field label { font-size: .74rem; font-weight: 700; color: #374151; }

.input-prefix-wrap { position: relative; }
.input-prefix {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  font-size: .82rem; font-weight: 700; color: #94a3b8;
}
.price-input {
  width: 100%; padding: 9px 10px 9px 24px;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: .85rem; color: #0f172a; background: white;
  outline: none; transition: border-color .2s; box-sizing: border-box;
}
.price-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

.price-editor-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-price-cancel {
  padding: 8px 18px; border-radius: 9px;
  background: #f1f5f9; color: #475569;
  font-weight: 600; font-size: .82rem; border: none; cursor: pointer; transition: background .2s;
}
.btn-price-cancel:hover { background: #e2e8f0; }
.btn-price-save {
  padding: 8px 20px; border-radius: 9px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-weight: 700; font-size: .82rem;
  border: none; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  box-shadow: 0 4px 14px rgba(37,99,235,.3);
  transition: all .2s;
}
.btn-price-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,.4); }
.btn-price-save:disabled { opacity: .6; cursor: not-allowed; }

.stock-row { display: flex; align-items: center; gap: 8px; }
.stock-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 8px #10b981;
  animation: blink 2s ease-in-out infinite; flex-shrink: 0;
}
.stock-dot.out { background: #94a3b8; box-shadow: none; animation: none; }
.stock-txt { font-size: .85rem; font-weight: 700; color: #10b981; }
.stock-txt.out { color: #94a3b8; }
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}

.specs-mini {
  border: 1.5px solid #e8edf8; border-radius: 16px; overflow: hidden;
}
.spec-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 16px; background: #f8faff;
  border-bottom: 1px solid #f1f5f9;
  transition: background .15s;
}
.spec-item:last-child { border-bottom: none; }
.spec-item:nth-child(even) { background: white; }
.spec-item:hover { background: #eff6ff; }
.spec-label { font-size: .82rem; color: #64748b; }
.spec-val   { font-size: .86rem; font-weight: 700; color: #0f172a; }

.buy-actions { display: flex; gap: 10px; }

.btn-cart {
  flex: 1.5; padding: 13px 16px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border: none; border-radius: 14px;
  font-size: .88rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  position: relative; overflow: hidden;
  box-shadow: 0 6px 20px rgba(37,99,235,.35);
  transition: transform .2s, box-shadow .2s;
}
.btn-cart:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,.45); }
.btn-cart:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
.btn-icon { width: 16px; height: 16px; flex-shrink: 0; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .55s;
}
.btn-cart:hover:not(:disabled) .btn-shine { left: 130%; }

.btn-buy {
  flex: 1; padding: 13px 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white; border: none; border-radius: 14px;
  font-size: .88rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 20px rgba(16,185,129,.35);
  transition: transform .2s, box-shadow .2s;
}
.btn-buy:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(16,185,129,.45); }
.btn-buy:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }

.admin-note {
  display: flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-radius: 12px; padding: 12px 16px;
  font-size: .8rem; color: #92400e; font-weight: 500;
}
.note-icon { width: 16px; height: 16px; flex-shrink: 0; color: #d97706; }

.spec-block {
  max-width: 1200px; margin: 24px auto 0;
  padding: 0 24px;
}
.section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
.section-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; white-space: nowrap; }
.section-line { flex: 1; height: 2px; background: linear-gradient(90deg, #e0e7ff, transparent); }

.spec-grid {
  background: white; border-radius: 20px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.07);
  overflow: hidden;
}
.spec-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 13px 22px; border-bottom: 1px solid #f1f5f9;
  font-size: .88rem; transition: background .15s;
}
.spec-row:last-child { border-bottom: none; }
.spec-row:hover { background: #f8faff; }
.spec-key { color: #94a3b8; font-weight: 500; }
.spec-val { color: #0f172a; font-weight: 700; text-align: right; max-width: 55%; }

/* ═══ LÔ HÀNG TỒN KHO ═══ */
.batch-block { max-width: 1200px; margin: 24px auto 0; padding: 0 24px; }
.batch-loading, .batch-empty {
  text-align: center; padding: 30px; color: #94a3b8; background: white;
  border-radius: 20px; border: 1.5px solid #e8edf8; font-size: .88rem;
}
.batch-wrap {
  background: white; border-radius: 20px; border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.07); overflow: hidden;
}
.batch-summary {
  display: flex; gap: 24px; padding: 18px 22px;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border-bottom: 1px solid #e8edf8;
}
.batch-summary-item { display: flex; flex-direction: column; gap: 4px; }
.bs-label { font-size: .72rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
.bs-value { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.bs-money { color: #4f46e5; }
.batch-table { width: 100%; border-collapse: collapse; font-size: .86rem; }
.batch-table th {
  text-align: left; padding: 12px 22px; font-size: .72rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid #f1f5f9; background: #fafbff;
}
.batch-table td { padding: 12px 22px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.batch-table tr:last-child td { border-bottom: none; }
.batch-table tr:hover td { background: #f8faff; }
.batch-qty { font-weight: 800; color: #10b981; }
.batch-subtotal { font-weight: 700; color: #0f172a; }

.loading-screen {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 60vh; gap: 16px; color: #94a3b8;
  font-size: .9rem;
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
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .product-shell { grid-template-columns: 1fr; }
  .main-image { height: 300px; }
}
@media (max-width: 640px) {
  .hero-banner { padding-bottom: 50px; }
  .hero-content { padding: 20px 14px 0; }
  .product-shell { margin: -20px auto 0; padding: 0 14px; }
  .spec-block { padding: 0 14px; }
  .batch-block { padding: 0 14px; }
  .toolbar-actions { width: 100%; }
  .btn-edit, .btn-delete { flex: 1; justify-content: center; }
  .buy-actions { flex-direction: column; }
  .price-editor-row { flex-direction: column; }
}
</style>