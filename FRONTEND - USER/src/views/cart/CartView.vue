<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
    <div class="max-w-7xl mx-auto px-4">

      <!-- HEADER -->
      <header class="text-center mb-12">
        <h1 class="text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
          Giỏ hàng
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-3">
          Xem lại sản phẩm trước khi thanh toán
        </p>
      </header>

      <!-- LOADING -->
      <section v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        <div class="lg:col-span-2 space-y-6">
          <div v-for="i in 3" :key="i" class="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
        <div class="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      </section>

      <!-- EMPTY CART -->
      <section
        v-else-if="!cart.items.length"
        class="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center shadow-xl"
      >
        <div class="text-8xl mb-6">🛒</div>
        <h2 class="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-3">
          Giỏ hàng trống
        </h2>
        <p class="text-gray-500 mb-10">
          Bạn chưa thêm sản phẩm nào
        </p>
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

      <!-- CART CONTENT -->
      <section v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <!-- LEFT: ITEMS -->
        <div class="lg:col-span-2 space-y-6">
          <article
            v-for="item in cart.items"
            :key="item.productId"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6
                   flex gap-6 hover:shadow-xl transition"
          >
            <img
              :src="item.images?.[0] || placeholder"
              class="w-28 h-36 object-cover rounded-xl border dark:border-gray-700"
            />

            <div class="flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ item.name }}
                </h3>
                <p class="text-orange-600 font-black text-2xl mt-2">
                  {{ formatPrice(item.price) }}₫
                </p>
              </div>

              <div class="flex items-center gap-4 mt-4">
                <button
                  @click="updateQuantity(item.productId, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                  class="qty-btn"
                >−</button>

                <span class="w-12 text-center font-bold text-lg text-gray-900 dark:text-white">
                  {{ item.quantity }}
                </span>

                <button
                  @click="updateQuantity(item.productId, item.quantity + 1)"
                  class="qty-btn bg-orange-500 text-white hover:bg-orange-600"
                >+</button>

                <button
                  @click="removeItem(item.productId)"
                  class="ml-auto text-sm text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xl font-black text-gray-900 dark:text-white">
                {{ formatPrice(item.price * item.quantity) }}₫
              </p>
            </div>
          </article>
        </div>

        <!-- RIGHT: SUMMARY -->
        <aside class="sticky top-6 h-fit bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <h2 class="text-2xl font-black mb-6 text-gray-900 dark:text-white">
            Thanh toán
          </h2>

          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>Số sản phẩm</span>
              <span>{{ cart.totalQuantity }}</span>
            </div>

            <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Tổng tiền</span>
              <span class="text-orange-600">
                {{ formatPrice(cart.totalPrice) }}₫
              </span>
            </div>
          </div>

          <div class="mt-8 space-y-4">
            <router-link
  to="/checkout"
  class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-black text-lg shadow-lg hover:scale-105 transition text-center block"
>
  Thanh toán ngay
</router-link>

            <button
              @click="clearCart"
              class="w-full py-3 rounded-xl
                     bg-gray-200 dark:bg-gray-700
                     text-gray-800 dark:text-white
                     font-semibold hover:bg-gray-300 transition"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>
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

const cart = ref({
  items: [],
  totalQuantity: 0,
  totalPrice: 0
})

const loading = ref(true)
const placeholder = "https://via.placeholder.com/400x600?text=No+Image"

const loadCart = async () => {
  loading.value = true
  try {
    const res = await CartService.getCart()
    cart.value = res || cart.value
  } catch (err) {
    if (err.message === "Chưa đăng nhập") {
      alert("Bạn cần đăng nhập để xem giỏ hàng")
      router.push("/user/login")
    } else {
      alert("Không thể tải giỏ hàng")
    }
  } finally {
    loading.value = false
  }
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

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(value)

onMounted(loadCart)
</script>

<style scoped>
.qty-btn {
  @apply w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700
         flex items-center justify-center text-xl font-bold
         hover:bg-gray-200 transition disabled:opacity-50;
}
</style>
