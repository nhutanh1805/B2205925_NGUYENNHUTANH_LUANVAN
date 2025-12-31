<template>
  <div v-if="product" class="max-w-7xl mx-auto p-6 lg:p-10 bg-gradient-to-b from-gray-50 to-white min-h-screen">
    <nav class="mb-8 text-sm text-gray-600">
      <router-link to="/products" class="hover:text-blue-600 transition">Danh sách sản phẩm</router-link>
      <span class="mx-3">></span>
      <span class="font-semibold text-gray-800">{{ product.name }}</span>
    </nav>

    <div class="lg:flex lg:gap-12">
      <div class="lg:w-1/2">
        <div class="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <img 
            :src="currentImage" 
            class="w-full h-[500px] object-contain bg-gray-50 transition-all duration-500"
          />
        </div>

        <div class="product-scroll flex gap-4 overflow-x-auto py-2">
          <div
            v-for="(img, i) in product.images"
            :key="i"
            class="mini-thumb cursor-pointer transition-all duration-300"
            :class="{ 'ring-4 ring-blue-500 ring-opacity-50 shadow-xl scale-110': currentImage === img }"
            @click="currentImage = img"
          >
            <img :src="img" class="mini-img rounded-xl" />
          </div>
        </div>
      </div>

      <div class="lg:w-1/2 mt-8 lg:mt-0 space-y-8">
        <div class="bg-white p-8 rounded-3xl shadow-2xl">
          <h1 class="text-4xl lg:text-5xl font-black text-gray-900 mb-4">{{ product.name }}</h1>
          
          <div class="flex items-end gap-6 mb-6">
            <div>
              <p class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600">
                {{ formatPrice(product.salePrice || product.price) }}₫
              </p>
              <p v-if="product.salePrice" class="text-2xl text-gray-400 line-through mt-2">
                {{ formatPrice(product.price) }}₫
              </p>
            </div>
            <span v-if="product.salePrice" class="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
              -{{ discountPercent }}%
            </span>
          </div>
        </div>

        <div class="bg-white p-8 rounded-3xl shadow-2xl grid grid-cols-2 gap-6 text-lg">
          <div class="flex items-center gap-4">
            <i class="bi bi-building text-2xl text-blue-600"></i>
            <div>
              <p class="text-gray-500 text-sm">Hãng</p>
              <p class="font-bold">{{ product.brand }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <i class="bi bi-box-seam text-2xl text-green-600"></i>
            <div>
              <p class="text-gray-500 text-sm">Tồn kho</p>
              <p class="font-bold text-green-600">{{ product.stock }} máy</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <i class="bi bi-award text-2xl text-yellow-600"></i>
            <div>
              <p class="text-gray-500 text-sm">Bảo hành</p>
              <p class="font-bold">{{ product.warrantyMonths }} tháng</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <i class="bi bi-geo-alt text-2xl text-purple-600"></i>
            <div>
              <p class="text-gray-500 text-sm">Xuất xứ</p>
              <p class="font-bold">{{ product.origin }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <button 
            @click="addToCart"
            :disabled="product.stock === 0"
            class="w-full py-6 text-2xl font-black rounded-3xl shadow-2xl transition-all duration-500 flex items-center justify-center gap-4"
            :class="{
              'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 hover:shadow-3xl': product.stock > 0,
              'bg-gray-400 text-gray-600 cursor-not-allowed': product.stock === 0
            }"
          >
            <i class="fas fa-shopping-cart text-3xl"></i>
            {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng' }}
          </button>

          <button 
            class="w-full py-5 text-xl font-bold rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl transition-all hover:scale-105"
          >
            Mua ngay
          </button>

          <div class="grid grid-cols-2 gap-4">
            <router-link 
              :to="`/products/edit/${product._id}`" 
              class="py-4 text-center font-bold rounded-3xl bg-yellow-500 hover:bg-yellow-600 text-black shadow-xl transition-all hover:scale-105"
            >
              Sửa sản phẩm
            </router-link>
            <button 
              @click="deleteProduct" 
              class="py-4 font-bold rounded-3xl bg-red-500 hover:bg-red-600 text-white shadow-xl transition-all hover:scale-105"
            >
              Xóa sản phẩm
            </button>
          </div>

          <router-link 
            to="/products" 
            class="block text-center py-4 font-bold rounded-3xl bg-gray-700 hover:bg-gray-800 text-white shadow-xl transition-all hover:scale-105"
          >
            Quay lại danh sách
          </router-link>
        </div>
      </div>
    </div>

    <div class="mt-16 bg-white p-10 rounded-3xl shadow-2xl">
      <h2 class="text-4xl font-black text-gray-800 mb-10 text-center">Thông số kỹ thuật</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="spec-item text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold mb-3 text-blue-800">Màn hình</h3>
          <p class="text-lg font-semibold">{{ product.specs.screen || "N/A" }}</p>
        </div>
        <div class="spec-item text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold mb-3 text-purple-800">Chip xử lý</h3>
          <p class="text-lg font-semibold">{{ product.specs.chip || "N/A" }}</p>
        </div>
        <div class="spec-item text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold mb-3 text-green-800">RAM</h3>
          <p class="text-lg font-semibold">{{ product.specs.ram || "N/A" }}</p>
        </div>
        <div class="spec-item text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold mb-3 text-yellow-800">Bộ nhớ</h3>
          <p class="text-lg font-semibold">{{ product.specs.storage || "N/A" }}</p>
        </div>
        <div class="spec-item text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold mb-3 text-red-800">Camera</h3>
          <p class="text-lg font-semibold">{{ product.specs.camera || "N/A" }}</p>
        </div>
        <div class="spec-item text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold mb-3 text-pink-800">Pin</h3>
          <p class="text-lg font-semibold">{{ product.specs.battery || "N/A" }}</p>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="showToast" class="fixed top-6 right-6 z-50">
        <div class="bg-gray-900 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-5 animate-fade-in">
          <i class="fas fa-check-circle text-green-400 text-3xl"></i>
          <div>
            <p class="font-bold text-lg">localhost thông báo:</p>
            <p class="text-base opacity-90">Đã thêm "{{ product.name }}" vào giỏ hàng</p>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <div v-else class="text-center py-32">
    <h2 class="text-4xl font-bold text-gray-500 mb-8">Sản phẩm không tồn tại</h2>
    <router-link to="/products" class="inline-block px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-3xl shadow-2xl transition-all hover:scale-105">
      Quay lại danh sách
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import CartService from "@/services/cart.service";

const route = useRoute();
const router = useRouter();
const product = ref(null);
const currentImage = ref("");
const showToast = ref(false);

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v);

const discountPercent = computed(() => {
  if (!product.value?.salePrice || !product.value?.price) return 0;
  return Math.round(((product.value.price - product.value.salePrice) / product.value.price) * 100);
});

const deleteProduct = async () => {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    try {
      await ProductService.delete(product.value._id);
      alert("Xóa thành công!");
      router.push("/products");
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm!");
    }
  }
};

async function addToCart() {
  if (product.value.stock === 0) return;

  try {
    await CartService.addToCart(product.value._id, 1);
    
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 4000);
  } catch (error) {
    alert("Thêm vào giỏ hàng thất bại!");
  }
}

onMounted(async () => {
  try {
    product.value = await ProductService.get(route.params.id);
    if (product.value?.images?.length) {
      currentImage.value = product.value.images[0];
    }
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
    el.addEventListener(ev, () => {
      isDown = false;
      el.classList.remove("dragging");
    })
  );

  el.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}
</script>

<style scoped>
.product-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  cursor: grab;
}

.product-scroll.dragging {
  cursor: grabbing;
}

.product-scroll::-webkit-scrollbar {
  height: 8px;
}

.product-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
}

.mini-thumb {
  flex: 0 0 100px;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.mini-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.mini-thumb:hover .mini-img {
  transform: scale(1.1);
}

.toast-enter-active {
  animation: toastInTop 0.6s ease;
}

.toast-leave-active {
  animation: toastOutTop 0.4s ease forwards;
}

@keyframes toastInTop {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toastOutTop {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
  }
}

.animate-fade-in {
  animation: toastInTop 0.6s ease;
}
</style>