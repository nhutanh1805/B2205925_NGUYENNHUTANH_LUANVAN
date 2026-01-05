<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
    <div class="max-w-7xl mx-auto px-4">

      <header class="text-center mb-12">
        <h1 class="text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
          Giỏ hàng
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-3">
          Xem lại sản phẩm trước khi thanh toán
        </p>
      </header>

      <section v-if="!loading && !cart.items.length" class="text-center py-20">
        <div class="text-9xl mb-6">🛒</div>
        <h2 class="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-3">Giỏ hàng trống</h2>
        <p class="text-gray-500 mb-10">Bạn chưa thêm sản phẩm nào</p>
        <router-link
          to="/products"
          class="inline-flex items-center gap-3 px-12 py-5 rounded-xl
                 bg-gradient-to-r from-orange-500 to-pink-600
                 text-white font-bold text-lg shadow-lg
                 hover:scale-105 transition"
        >
          🛍️ Tiếp tục mua sắm
        </router-link>
      </section>

      <section v-if="loading" class="space-y-6 animate-pulse">
        <div v-for="i in 3" :key="i" class="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      </section>

      <section v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 flex flex-wrap gap-6">
          <div v-for="item in cart.items" :key="item.productId" class="mini-card group">
            
            <span v-if="item.salePrice" class="badge badge-sale">SALE</span>
            <div class="relative overflow-hidden rounded-2xl mb-3">
              <img :src="item.images?.[0] || placeholder" class="mini-img" />
              <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
            </div>

            <h4 class="mini-name">{{ item.name }}</h4>
            <div class="flex items-center justify-between mb-2">
              <p class="mini-price">{{ formatPrice(item.price * item.quantity) }}₫</p>
              <span class="mini-stock text-xs">x{{ item.quantity }}</span>
            </div>

            <div class="flex items-center gap-2 justify-center mt-2">
              <button @click="updateQuantity(item.productId, item.quantity - 1)" :disabled="item.quantity <= 1" class="qty-btn mini-btn">−</button>
              <span class="font-bold">{{ item.quantity }}</span>
              <button @click="updateQuantity(item.productId, item.quantity + 1)" class="qty-btn mini-btn bg-orange-500 text-white hover:bg-orange-600">+</button>
              <button @click="removeItem(item.productId)" class="text-sm text-red-500 hover:underline ml-2">Xóa</button>
            </div>

          </div>
        </div>

        <aside class="sticky top-6 h-fit bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 flex flex-col gap-6">
          <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white">Thanh toán</h2>
          
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <div class="flex justify-between"><span>Số sản phẩm: </span><span>{{ cart.totalQuantity }}</span></div>
            <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Tổng tiền: </span>
              <span class="text-orange-600">{{ formatPrice(cart.totalPrice) }}₫</span>
            </div>
          </div>

          <router-link
            to="/checkout"
            class="w-full py-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center block"
          >
            Thanh toán ngay
          </router-link>

          <button
            @click="clearCart"
            class="w-full py-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Xóa toàn bộ giỏ hàng
          </button>
        </aside>

      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import CartService from "@/services/cart.service"

const router = useRouter()
const cart = ref({ items: [], totalQuantity: 0, totalPrice: 0 })
const loading = ref(true)
const placeholder = "https://via.placeholder.com/148x200?text=No+Image"

const loadCart = async () => {
  loading.value = true
  try {
    const res = await CartService.getCart()
    cart.value = res || cart.value
  } catch (err) {
    if (err.message === "Chưa đăng nhập") {
      alert("Bạn cần đăng nhập để xem giỏ hàng")
      router.push("/user/login")
    } else alert("Không thể tải giỏ hàng")
  } finally { loading.value = false }
}

const updateQuantity = async (productId, quantity) => {
  if (quantity < 1) return
  await CartService.updateQuantity({ productId, quantity })
  await loadCart()
}

const removeItem = async (productId) => {
  if (!confirm("Xóa sản phẩm này?")) return
  await CartService.removeItem(productId)
  await loadCart()
}

const clearCart = async () => {
  if (!confirm("Xóa toàn bộ giỏ hàng?")) return
  await CartService.clearCart()
  await loadCart()
}

const formatPrice = value => new Intl.NumberFormat("vi-VN").format(value)
onMounted(loadCart)
</script>

<style scoped>

.mini-card { position: relative; flex: 0 0 160px; background: white; border-radius: 20px; padding: 12px; text-align: center; cursor: pointer; border: 1px solid #e5e7eb; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.mini-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 24px rgba(0,0,0,0.15); border-color: #3b82f6; }
.mini-img { width: 128px; height: 180px; object-fit: cover; border-radius: 16px; margin-bottom: 8px; transition: transform 0.3s ease; }
.mini-card:hover .mini-img { transform: scale(1.05); }
.mini-name { font-size: 0.9rem; font-weight: 700; height: 2.4em; overflow: hidden; line-height: 1.2; margin-bottom: 6px; }
.mini-price { font-size: 1rem; font-weight: bold; color: #dc2626; margin-bottom: 4px; }
.mini-stock { font-size: 0.75rem; color: #6b7280; }
.badge { position: absolute; top: 8px; left: 8px; font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: 999px; color: white; z-index: 10; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
.badge-sale { background: linear-gradient(135deg, #ef4444, #f97316); }
.qty-btn.mini-btn { width: 28px; height: 28px; font-size: 0.9rem; }
</style>
