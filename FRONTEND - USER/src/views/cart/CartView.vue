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
        
        <div class="lg:col-span-2 flex flex-col gap-4">
          <div v-for="item in cart.items" :key="item.productId" class="cart-row group">

            <div class="relative">
              <img :src="item.images?.[0] || placeholder" class="order-mini-img" />
              <span v-if="item.salePrice" class="badge badge-sale">SALE</span>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <div>
                <h4 class="cart-name">{{ item.name }}</h4>
                <p class="cart-price">{{ formatPrice(item.price * item.quantity) }}₫</p>
              </div>

              <div class="flex items-center gap-3 mt-2">
                <button
                  @click="updateQuantity(item.productId, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                  class="qty-btn"
                >−</button>

                <span class="font-bold">{{ item.quantity }}</span>

                <button
                  @click="updateQuantity(item.productId, item.quantity + 1)"
                  class="qty-btn bg-orange-500 text-white hover:bg-orange-600"
                >+</button>

                <button
                  @click="removeItem(item.productId)"
                  class="text-sm text-red-500 hover:underline ml-4"
                >
                  Xóa
                </button>
              </div>
            </div>

          </div>
        </div>

        <aside class="sticky top-6 h-fit bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 flex flex-col gap-6">
          <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white">Thanh toán</h2>

          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>Số sản phẩm:</span>
              <span>{{ cart.totalQuantity }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Tổng tiền:</span>
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
const placeholder = "https://via.placeholder.com/120x160?text=No+Image"

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
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (productId, quantity) => {
  if (quantity < 1) return
  await CartService.updateQuantity({ productId, quantity })
  await loadCart()
}

const removeItem = async productId => {
  if (!confirm("Xóa sản phẩm này?")) return
  await CartService.removeItem(productId)
  await loadCart()
}

const clearCart = async () => {
  if (!confirm("Xóa toàn bộ giỏ hàng?")) return
  await CartService.clearCart()
  await loadCart()
}

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v)

onMounted(loadCart)
</script>

<style scoped>
.cart-row {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
}

.cart-row:hover {
  box-shadow: 0 14px 26px rgba(0,0,0,0.16);
  transform: translateY(-2px);
}

.order-mini-img {
  width: 64px;
  height: 88px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.cart-name {
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.cart-price {
  font-size: 0.95rem;
  font-weight: bold;
  color: #dc2626;
  margin-top: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e5e7eb;
  font-weight: bold;
  transition: 0.2s;
}

.qty-btn:hover {
  background: #d1d5db;
}

.badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.badge-sale {
  background: linear-gradient(135deg, #ef4444, #f97316);
}
</style>
