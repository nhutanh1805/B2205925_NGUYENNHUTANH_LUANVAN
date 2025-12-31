<template>
  <div class="cart-page min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-12 px-4">
    <div class="container mx-auto max-w-6xl">
      <h1 class="text-5xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Giỏ hàng của bạn
      </h1>

      <div v-if="loading" class="space-y-8">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-pulse">
          <div class="flex items-center gap-8">
            <div class="w-32 h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div class="flex-1 space-y-4">
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div class="flex gap-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="cart.items.length" class="space-y-6">
        <div 
          v-for="item in cart.items" 
          :key="item.productId" 
          class="cart-item bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-2"
        >
          <div class="flex flex-col md:flex-row items-center gap-8 p-8">
            <div class="relative">
              <img 
                :src="item.images?.[0] || placeholder" 
                alt="product" 
                class="w-36 h-48 object-cover rounded-2xl shadow-lg"
              />
              <div class="absolute inset-0 rounded-2xl ring-4 ring-blue-500 ring-opacity-20 pointer-events-none"></div>
            </div>

            <div class="flex-1 text-center md:text-left">
              <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-3">{{ item.name }}</h3>
              <p class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600 mb-6">
                {{ formatPrice(item.price) }}₫
              </p>

              <div class="flex items-center justify-center md:justify-start gap-4">
                <button 
                  @click="updateQuantity(item.productId, item.quantity - 1)"
                  class="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 flex items-center justify-center text-2xl font-bold text-gray-700 shadow-lg transition-all hover:scale-110"
                  :disabled="item.quantity <= 1"
                >−</button>
                
                <span class="text-2xl font-bold text-gray-800 dark:text-white w-20 text-center">{{ item.quantity }}</span>
                
                <button 
                  @click="updateQuantity(item.productId, item.quantity + 1)"
                  class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-all hover:scale-110"
                >+</button>
              </div>
            </div>

            <div class="text-center">
              <p class="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {{ formatPrice(item.price * item.quantity) }}₫
              </p>
              <button 
                @click="removeItem(item.productId)" 
                class="text-red-500 hover:text-red-700 font-semibold text-lg transition-all hover:scale-105"
              >
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-10 text-white mt-12">
          <div class="flex flex-col md:flex-row justify-between items-center gap-8">
            <div class="text-center md:text-left">
              <p class="text-2xl font-light mb-2">Tổng thanh toán</p>
              <p class="text-5xl font-black">
                {{ formatPrice(cart.totalPrice) }}₫
              </p>
              <p class="text-xl mt-3 opacity-90">{{ cart.totalQuantity }} sản phẩm</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-6">
              <button 
                @click="clearCart" 
                class="px-10 py-5 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white font-bold rounded-2xl border-2 border-white/30 transition-all hover:scale-105 shadow-xl"
              >
                Xóa toàn bộ giỏ
              </button>
              <button class="px-12 py-5 bg-white hover:bg-gray-100 text-blue-600 font-black rounded-2xl transition-all hover:scale-105 shadow-2xl text-xl">
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-24">
        <div class="text-8xl mb-8 opacity-30">🛒</div>
        <p class="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-6">Giỏ hàng trống</p>
        <p class="text-xl text-gray-500 dark:text-gray-500 mb-10">Hãy thêm sản phẩm yêu thích vào giỏ nào!</p>
        <router-link 
          to="/products" 
          class="inline-block px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-3xl shadow-2xl transition-all hover:scale-105"
        >
          Tiếp tục mua sắm
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import CartService from "@/services/cart.service";

const router = useRouter();
const cart = ref({ items: [], totalQuantity: 0, totalPrice: 0 });
const loading = ref(true);
const placeholder = "https://via.placeholder.com/400x600?text=No+Image";

async function loadCart() {
  loading.value = true;
  try {
    const response = await CartService.getCart();
    cart.value = response || { items: [], totalQuantity: 0, totalPrice: 0 };
  } catch (error) {
    if (error.message === "Chưa đăng nhập") {
      alert("Bạn cần đăng nhập để xem giỏ hàng!");
      router.push("/user/login");
    } else {
      alert("Không thể tải giỏ hàng. Vui lòng thử lại sau!");
      cart.value = { items: [], totalQuantity: 0, totalPrice: 0 };
    }
  } finally {
    loading.value = false;
  }
}

async function updateQuantity(productId, quantity) {
  if (quantity < 1) return;
  try {
    await CartService.updateQuantity({ productId, quantity });
    await loadCart();
  } catch (error) {
    alert("Cập nhật số lượng thất bại!");
  }
}

async function removeItem(productId) {
  if (!confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
  try {
    await CartService.removeItem(productId);
    await loadCart();
  } catch (error) {
    alert("Xóa sản phẩm thất bại!");
  }
}

async function clearCart() {
  if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
  try {
    await CartService.clearCart();
    await loadCart();
  } catch (error) {
    alert("Xóa giỏ hàng thất bại!");
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

onMounted(loadCart);
</script>

<style scoped>
.cart-page {
  font-family: 'Inter', system-ui, sans-serif;
}

.cart-item {
  position: relative;
  overflow: hidden;
}

.cart-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05));
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.cart-item:hover::before {
  opacity: 1;
}

.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
}

.dark .shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.5);
}
</style>