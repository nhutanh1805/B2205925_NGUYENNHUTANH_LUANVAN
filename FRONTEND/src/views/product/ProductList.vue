<template>
  <div class="products-page min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
    <div class="container mx-auto max-w-7xl px-4">

      <div class="hero-box relative overflow-hidden text-white mb-10 rounded-3xl shadow-2xl">
  <div class="hero-bg"></div>

  <div class="relative z-10 py-14 px-6 text-center">
    <h1 class="text-5xl font-extrabold mb-4 tracking-tight">
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


      <div class="bg-white rounded-3xl shadow-xl p-6 sticky top-6">

        <InputSearch
          v-model="searchText"
          @submit="refreshList"
          class="mb-6"
        />

        <h3 class="text-2xl font-bold text-blue-600 mb-4">
          Danh sách sản phẩm ({{ filteredProductsCount }})
        </h3>

        <div v-if="filteredProductsCount" class="product-scroll">
          <div
            v-for="product in filteredProducts"
            :key="product._id"
            class="mini-card"
            @click="goDetail(product._id)"
          >
            <span v-if="product.salePrice" class="badge badge-sale">SALE</span>
            <span v-else-if="product.stock === 0" class="badge badge-out">HẾT</span>

            <img
              :src="product.images?.[0] || placeholder"
              class="mini-img"
            />

            <h4 class="mini-name">{{ product.name }}</h4>

            <p class="mini-price">
              {{ formatPrice(product.salePrice || product.price) }}₫
            </p>

            <span class="mini-stock">
              Còn {{ product.stock }} máy
            </span>
          </div>
        </div>

        <p v-else class="text-center text-gray-500 italic py-12">
          Không có sản phẩm phù hợp
        </p>

        <div class="flex flex-wrap justify-center gap-4 mt-8">
          <button class="btn btn-primary" @click="refreshList">
            Làm mới
          </button>

          <router-link to="/products/add" class="btn btn-success">
            Thêm mới
          </router-link>

          <button class="btn btn-danger" @click="removeAllProducts">
            Xóa tất cả
          </button>
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
const placeholder = "https://via.placeholder.com/112x160";

onMounted(async () => {
  await refreshList();
  nextTick(initDragScroll);
});

function goDetail(id) {
  router.push(`/products/${id}`);
}

async function refreshList() {
  const res = await ProductService.getAll();
  products.value = res.products || res;
}

async function removeAllProducts() {
  if (confirm("Xóa toàn bộ sản phẩm?")) {
    await ProductService.deleteAll();
    refreshList();
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
  const el = document.querySelector(".product-scroll");
  if (!el) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

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
.hero-box {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.product-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  scroll-snap-type: x mandatory;
  cursor: grab;
}
.product-scroll.dragging { cursor: grabbing; }

.product-scroll::-webkit-scrollbar {
  height: 6px;
}
.product-scroll::-webkit-scrollbar-thumb {
  background: rgba(59,130,246,.6);
  border-radius: 3px;
}

.mini-card {
  position: relative;
  flex: 0 0 140px;
  background: white;
  border-radius: 16px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  scroll-snap-align: start;
  transition: .25s;
}

.mini-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 30px rgba(0,0,0,.15);
}

.mini-img {
  width: 112px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  margin: 0 auto 8px;
  transition: transform .25s;
}

.mini-card:hover .mini-img {
  transform: scale(1.05);
}

.mini-name {
  font-size: .8rem;
  font-weight: 700;
  height: 2.4em;
  overflow: hidden;
}

.mini-price {
  font-size: .85rem;
  font-weight: bold;
  color: #dc2626;
}

.mini-stock {
  font-size: .7rem;
  opacity: .7;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: .65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  color: white;
}
.badge-sale {
  background: linear-gradient(135deg,#ef4444,#f97316);
}
.badge-out {
  background: #6b7280;
}

.btn {
  @apply px-5 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl;
}
.btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
.btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
.btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }

.hero-box {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,.25), transparent 40%),
    radial-gradient(circle at 80% 0%, rgba(255,255,255,.2), transparent 40%),
    radial-gradient(circle at 50% 100%, rgba(0,0,0,.2), transparent 50%);
  filter: blur(20px);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 8px;
}

.hero-stat {
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 16px;
  padding: 14px 22px;
  min-width: 110px;
}

.stat-number {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
}

.stat-label {
  font-size: .75rem;
  opacity: .85;
  letter-spacing: .05em;
}


</style>
