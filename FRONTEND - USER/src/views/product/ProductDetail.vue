<template>
  <div v-if="product" class="page">

    <!-- ================= TOP ================= -->
    <div class="product-layout">

      <!-- ================= GALLERY ================= -->
      <div>
        <div class="main-image">
          <img :src="currentImage" />
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

      <!-- ================= BUY BOX ================= -->
      <div class="buybox">

        <h1 class="title">{{ product.name }}</h1>

        <!-- sold -->
        <div class="sold">
          ⭐ {{ product.rating || 4.8 }}
          | Đã bán {{ product.sold }}
        </div>

        <!-- price -->
        <div class="price-box">
          <span class="sale">
            {{ formatPrice(product.salePrice || product.price) }}₫
          </span>

          <span v-if="product.salePrice" class="origin">
            {{ formatPrice(product.price) }}₫
          </span>

          <span v-if="discountPercent" class="discount">
            -{{ discountPercent }}%
          </span>
        </div>

        <!-- voucher -->
        <div class="voucher">
          🎫 Giảm 50K đơn từ 1tr
        </div>

        <!-- shipping -->
        <div class="shipping">
          🚚 Giao từ Cần Thơ • 2-4 ngày
        </div>

        <!-- stock -->
        <div class="stock" :class="{ out: product.stock === 0 }">
          {{ product.stock > 0 ? "Còn hàng" : "Hết hàng" }}
        </div>

        <!-- quantity -->
        <div class="qty">
          <span>Số lượng</span>
          <button @click="decrease">-</button>
          <b>{{ quantity }}</b>
          <button @click="increase">+</button>
        </div>

        <!-- actions -->
        <div class="actions">
          <button
            class="btn-primary"
            :disabled="product.stock === 0"
            @click="addToCart"
          >
            🛒 Thêm vào giỏ
          </button>

          <button class="btn-success" @click="buyNow">
            ⚡ Mua ngay
          </button>

          <button
            class="btn-outline"
            :class="{ favorited: isFavorited }"
            @click="toggleFavorite"
          >
            {{ isFavorited ? "❤️" : "🤍" }} Yêu thích
          </button>
        </div>

        <!-- trust -->
        <div class="trust">
          ✔ Hàng chính hãng &nbsp;
          ✔ 7 ngày đổi trả &nbsp;
          ✔ Bảo hành {{ product.warrantyMonths }} tháng
        </div>

      </div>
    </div>

    <!-- ================= SHOP ================= -->
    <div class="shop-card">
      <div>
        <b>Nhựt Anh Store</b>
        <p>⭐ 4.9 | 1.2k sản phẩm</p>
      </div>
      <div>
        <button class="btn-outline">Xem shop</button>
        <button class="btn-outline">💬 Chat</button>
      </div>
    </div>

    <!-- ================= TABS ================= -->
    <div class="tabs">
      <div class="tab-header">
        <button
          v-for="t in tabs"
          :key="t"
          :class="{ active: tab === t }"
          @click="tab = t"
        >
          {{ t }}
        </button>
      </div>

      <!-- DESCRIPTION -->
      <div v-if="tab === 'Mô tả'" class="tab-content">
        <p>{{ product.description }}</p>
      </div>

      <!-- SPECS -->
      <div v-if="tab === 'Thông số'" class="tab-content">
        <div
          v-for="([key, value]) in specEntries"
          :key="key"
          class="spec-row"
        >
          <span>{{ formatKey(key) }}</span>
          <b>{{ value }}</b>
        </div>
      </div>

      <div v-if="tab === 'Đánh giá'" class="tab-content">
        <ProductReview
          :product-id="product._id"
          :current-user-id="currentUserId"
        />
      </div>
    </div>

    <!-- ================= RELATED ================= -->
    <h2 class="related-title">Có thể bạn cũng thích</h2>

    <div class="related">
      <div
        v-for="item in related"
        :key="item._id"
        class="card"
        @click="goProduct(item._id)"
      >
        <img :src="item.images[0]" />
        <p>{{ item.name }}</p>
        <b>{{ formatPrice(item.price) }}₫</b>
      </div>
    </div>

    <!-- toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast">
        ✅ Đã thêm vào giỏ hàng
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

const route = useRoute();
const router = useRouter();

const product = ref(null);
const related = ref([]);

const currentImage = ref("");
const quantity = ref(1);
const showToast = ref(false);
const isFavorited = ref(false);

const tabs = ["Mô tả", "Thông số", "Đánh giá"];
const tab = ref("Mô tả");

// ✅ Lấy userId từ localStorage (hoặc thay bằng store nếu dùng Pinia/Vuex)
const currentUserId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user._id || user.id || "";
  } catch {
    return "";
  }
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

const formatKey = (k) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

function increase() {
  if (quantity.value < product.value.stock) quantity.value++;
}

function decrease() {
  if (quantity.value > 1) quantity.value--;
}

async function addToCart() {
  await CartService.addToCart(product.value._id, quantity.value);
  showToast.value = true;
  setTimeout(() => (showToast.value = false), 2500);
}

async function buyNow() {
  await addToCart();
  router.push("/checkout");
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

function goProduct(id) {
  router.push(`/product/${id}`);
}

onMounted(async () => {
  const res = await ProductService.get(route.params.id);
  product.value = res;

  currentImage.value = res.images?.[0] || "https://via.placeholder.com/600";

  related.value = await ProductService.getRelated(res.category);

  // ✅ Kiểm tra trạng thái yêu thích
  const fav = JSON.parse(localStorage.getItem("favorite") || "[]");
  isFavorited.value = fav.includes(res._id);
});
</script>

<style scoped>
.page { max-width: 1200px; margin: auto; padding: 30px; }

.product-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
}

/* gallery */
.main-image img {
  width: 100%;
  height: 450px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 12px;
}

.thumb-list { display: flex; gap: 10px; margin-top: 10px; }

.thumb {
  width: 70px; height: 70px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
}
.thumb.active { border-color: #2563eb; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

/* buybox */
.buybox {
  border: 1px solid #eee;
  padding: 24px;
  border-radius: 12px;
  background: white;
}

.title { font-size: 26px; font-weight: 700; }

.sold { color: #6b7280; font-size: 14px; margin: 8px 0; }

.price-box { display: flex; gap: 10px; align-items: center; margin: 12px 0; }

.sale { font-size: 28px; color: #ef4444; font-weight: bold; }
.origin { text-decoration: line-through; color: #999; }
.discount {
  background: #ef4444; color: white;
  padding: 3px 8px; border-radius: 6px;
  font-size: 13px; font-weight: 600;
}

.voucher { font-size: 14px; margin: 8px 0; }
.shipping { font-size: 14px; margin: 8px 0; color: #374151; }

.stock { font-size: 14px; font-weight: 600; color: #16a34a; margin: 8px 0; }
.stock.out { color: #ef4444; }

.qty {
  display: flex; gap: 10px;
  align-items: center; margin: 15px 0;
}
.qty button {
  width: 32px; height: 32px;
  border: 1px solid #ddd; background: white;
  cursor: pointer; border-radius: 6px;
  font-size: 18px; font-weight: 600;
}
.qty button:hover { border-color: #2563eb; color: #2563eb; }

.actions { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }

.btn-primary {
  flex: 1; padding: 12px;
  background: #2563eb; color: white;
  border: none; border-radius: 8px;
  cursor: pointer; font-weight: 600;
  transition: opacity 0.2s;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary:not(:disabled):hover { background: #1d4ed8; }

.btn-success {
  flex: 1; padding: 12px;
  background: #16a34a; color: white;
  border: none; border-radius: 8px;
  cursor: pointer; font-weight: 600;
}
.btn-success:hover { background: #15803d; }

.btn-outline {
  padding: 10px 16px;
  border: 1px solid #ddd;
  background: white; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
}
.btn-outline:hover { border-color: #2563eb; color: #2563eb; }
.btn-outline.favorited { border-color: #ef4444; color: #ef4444; }

.trust {
  margin-top: 15px;
  font-size: 13px; color: #555;
  line-height: 2;
}

/* shop */
.shop-card {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eee;
  padding: 20px; border-radius: 12px;
  background: white;
  gap: 12px;
}
.shop-card > div:last-child { display: flex; gap: 10px; }

/* tabs */
.tabs {
  margin-top: 30px;
  background: white;
  padding: 20px; border-radius: 12px;
  border: 1px solid #eee;
}

.tab-header { display: flex; gap: 4px; margin-bottom: 20px; }
.tab-header button {
  padding: 10px 20px;
  border: none; background: #f3f4f6;
  cursor: pointer; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  transition: all 0.2s;
}
.tab-header button:hover { background: #e5e7eb; }
.tab-header .active { background: #2563eb; color: white; }

.tab-content { padding-top: 4px; }

.spec-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
  font-size: 14px;
}
.spec-row span { color: #6b7280; }

/* related */
.related-title { margin-top: 40px; font-size: 20px; font-weight: 700; }

.related {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.card {
  border: 1px solid #eee;
  padding: 12px; border-radius: 12px;
  cursor: pointer; background: white;
  transition: box-shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1); }
.card img {
  width: 100%; height: 150px;
  object-fit: contain;
}
.card p {
  font-size: 13px; margin: 8px 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card b { color: #ef4444; font-size: 14px; }

/* toast */
.toast {
  position: fixed;
  top: 20px; right: 20px;
  background: #111827;
  color: white;
  padding: 14px 22px;
  border-radius: 10px;
  z-index: 9999;
  font-size: 14px;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-12px); }

@media (max-width: 900px) {
  .product-layout { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .actions { flex-direction: column; }
  .btn-primary, .btn-success { width: 100%; }
}
</style>