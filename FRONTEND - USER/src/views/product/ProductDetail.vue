<template>
  <div v-if="product" class="max-w-7xl mx-auto p-6 lg:p-10 bg-gray-50 min-h-screen">
    <!-- Breadcrumb -->
    <nav class="mb-6 text-sm text-gray-500">
      <router-link to="/products" class="hover:text-blue-600">Danh sách</router-link>
      <span class="mx-2">/</span>
      <span class="font-semibold text-gray-700">{{ product.name }}</span>
    </nav>

    <div class="lg:flex lg:gap-10">
      <!-- Hình ảnh -->
      <div class="lg:flex-1">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
          <img :src="currentImage" class="w-full h-[400px] object-contain bg-gray-50"/>
        </div>
        <div class="product-scroll flex gap-4 overflow-x-auto py-2">
          <div
            v-for="(img, i) in product.images"
            :key="i"
            class="mini-card"
            :class="{ 'border-blue-500 shadow-lg': currentImage === img }"
            @click="currentImage = img"
          >
            <span v-if="product.salePrice" class="badge badge-sale">SALE</span>
            <span v-else-if="product.stock === 0" class="badge badge-out">HẾT</span>
            <img :src="img" class="mini-img"/>
          </div>
        </div>
      </div>

      <!-- Thông tin sản phẩm -->
      <div class="lg:flex-1 mt-6 lg:mt-0 space-y-6">
        <!-- Tên và giá -->
        <div class="bg-white p-6 rounded-2xl shadow-lg">
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">{{ product.name }}</h1>
          <div class="flex items-baseline gap-4 mb-3">
            <p class="text-3xl lg:text-5xl font-bold text-red-600">{{ formatPrice(product.salePrice || product.price) }}₫</p>
            <p v-if="product.salePrice" class="text-lg lg:text-2xl text-gray-400 line-through">{{ formatPrice(product.price) }}₫</p>
          </div>
          <span v-if="product.salePrice" class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Giảm {{ discountPercent }}%</span>
        </div>

        <!-- Thông tin nhanh xịn xò -->
        <div class="bg-white p-6 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm lg:text-base">
          <div class="flex items-center gap-2"><i class="bi bi-building text-blue-500"></i> <span class="font-semibold">Hãng:</span> <span class="ml-auto">{{ product.brand }}</span></div>
          <div class="flex items-center gap-2"><i class="bi bi-check2-circle text-green-500"></i> <span class="font-semibold">Tình trạng:</span> <span class="ml-auto text-green-600 font-bold">{{ formatCondition(product.condition) }}</span></div>
          <div class="flex items-center gap-2"><i class="bi bi-box-seam text-gray-500"></i> <span class="font-semibold">Tồn kho:</span> <span class="ml-auto font-semibold">{{ product.stock }} máy</span></div>
          <div class="flex items-center gap-2"><i class="bi bi-hash text-purple-500"></i> <span class="font-semibold">IMEI:</span> <span class="ml-auto font-mono">{{ product.imei || "N/A" }}</span></div>
          <div class="flex items-center gap-2"><i class="bi bi-award text-yellow-500"></i> <span class="font-semibold">Bảo hành:</span> <span class="ml-auto font-bold">{{ product.warrantyMonths }} tháng</span></div>
          <div class="flex items-center gap-2"><i class="bi bi-geo-alt text-red-500"></i> <span class="font-semibold">Xuất xứ:</span> <span class="ml-auto font-semibold">{{ product.origin }}</span></div>
        </div>

        <!-- Hành động -->
        <div class="space-y-3">
          <router-link to="/products/add" class="btn btn-success w-full">Thêm sản phẩm mới</router-link>
          <button class="btn btn-primary w-full">Thêm vào giỏ hàng</button>
          <button class="btn btn-success w-full">Mua ngay</button>
          <router-link :to="`/products/edit/${product._id}`" class="btn w-full bg-yellow-500 hover:bg-yellow-600 text-black">Sửa sản phẩm</router-link>
          <button @click="deleteProduct" class="btn btn-danger w-full">Xóa sản phẩm</button>
          <router-link to="/products" class="btn w-full bg-gray-600 hover:bg-gray-700 text-black">Quay lại danh sách</router-link>
        </div>
      </div>
    </div>

    <!-- Thông số kỹ thuật -->
    <div class="mt-10 lg:mt-16 bg-white p-6 lg:p-10 rounded-2xl shadow-lg">
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">Thông số kỹ thuật</h2>
      <div class="grid md:grid-cols-3 gap-4 lg:gap-6 text-sm lg:text-base">
        <div class="spec-card bg-gray-50 p-4 rounded-xl shadow-sm"><h3>Màn hình</h3><p>{{ product.specs.screen || "N/A" }}</p></div>
        <div class="spec-card bg-gray-50 p-4 rounded-xl shadow-sm"><h3>Chip xử lý</h3><p>{{ product.specs.chip || "N/A" }}</p></div>
        <div class="spec-card bg-gray-50 p-4 rounded-xl shadow-sm"><h3>RAM</h3><p>{{ product.specs.ram || "N/A" }}</p></div>
        <div class="spec-card bg-gray-50 p-4 rounded-xl shadow-sm"><h3>Bộ nhớ</h3><p>{{ product.specs.storage || "N/A" }}</p></div>
        <div class="spec-card bg-gray-50 p-4 rounded-xl shadow-sm"><h3>Camera</h3><p>{{ product.specs.camera || "N/A" }}</p></div>
        <div class="spec-card bg-gray-50 p-4 rounded-xl shadow-sm"><h3>Pin</h3><p>{{ product.specs.battery || "N/A" }}</p></div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <h2 class="text-3xl lg:text-4xl font-bold text-gray-500 mb-4">Sản phẩm không tồn tại</h2>
    <router-link to="/products" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Quay lại danh sách</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const route = useRoute();
const router = useRouter();
const product = ref(null);
const currentImage = ref("");

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v);
const discountPercent = computed(() => {
  if (!product.value?.salePrice || !product.value?.price) return 0;
  return Math.round(((product.value.price - product.value.salePrice) / product.value.price) * 100);
});
const formatCondition = c => {
  const map = { "brand-new": "Máy mới 100%", "like-new": "Like new 99%", "99%": "99% nguyên bản", "98%": "98% nguyên bản" };
  return map[c] || c;
};

const deleteProduct = async () => {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    try {
      await ProductService.delete(product.value._id);
      alert("Xóa thành công!");
      router.push("/products");
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm: " + err.message);
    }
  }
};

onMounted(async () => {
  try {
    product.value = await ProductService.get(route.params.id);
    currentImage.value = product.value.images[0];
    nextTick(initDragScroll);
  } catch (err) {
    console.error(err);
  }
});

function initDragScroll() {
  const el = document.querySelector(".product-scroll");
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
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX) * 1.3;
  });
}
</script>

<style scoped>
.product-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 12px; cursor: grab; }
.product-scroll.dragging { cursor: grabbing; }
.product-scroll::-webkit-scrollbar { height: 6px; }
.product-scroll::-webkit-scrollbar-thumb { background: rgba(59,130,246,.6); border-radius: 3px; }

.mini-card { position: relative; flex: 0 0 90px; background: white; border-radius: 16px; padding: 4px; text-align: center; cursor: pointer; border: 1px solid #e5e7eb; scroll-snap-align: start; transition: all .3s; }
.mini-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,.1); }
.mini-card.border-blue-500 { border: 2px solid #3b82f6; }

.mini-img { width: 80px; height: 110px; object-fit: cover; border-radius: 12px; margin: 0 auto; transition: transform .25s; }
.mini-card:hover .mini-img { transform: scale(1.05); }

.badge { position: absolute; top: 4px; left: 4px; font-size: .65rem; font-weight: 700; padding: 2px 6px; border-radius: 999px; color: white; }
.badge-sale { background: linear-gradient(135deg,#ef4444,#f97316); }
.badge-out { background: #6b7280; }

.spec-card h3 { font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
.spec-card p { color: #4b5563; font-weight: 500; }

.btn { @apply px-5 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl; }
.btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
.btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
.btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }
</style>
