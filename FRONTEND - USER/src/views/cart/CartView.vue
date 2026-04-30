<template>
  <div
    class="min-h-screen bg-gradient-to-br
           from-slate-50 via-white to-slate-100
           dark:from-gray-900 dark:via-gray-900 dark:to-black py-12"
  >
    <div class="max-w-7xl mx-auto px-4">

      <!-- ===== HEADER ===== -->
      <header class="text-center mb-14">
        <h1
          class="text-5xl font-black tracking-tight
          bg-gradient-to-r from-orange-500 via-pink-500 to-red-500
          bg-clip-text text-transparent"
        >
          🛒 Giỏ hàng của bạn
        </h1>

        <p class="text-gray-500 dark:text-gray-400 mt-4 text-lg">
          Kiểm tra sản phẩm trước khi thanh toán
        </p>
      </header>

      <!-- ===== EMPTY CART ===== -->
      <section
        v-if="!loading && !cart.items.length"
        class="empty-box"
      >
        <div class="text-[120px]">🛍️</div>

        <h2 class="text-3xl font-bold mt-4">
          Giỏ hàng đang trống
        </h2>

        <p class="text-gray-500 mt-2 mb-10">
          Hãy thêm sản phẩm yêu thích của bạn
        </p>

        <router-link to="/products" class="btn-main">
          Tiếp tục mua sắm
        </router-link>
      </section>

      <!-- ===== LOADING ===== -->
      <section v-if="loading" class="space-y-6 animate-pulse">
        <div v-for="i in 3" :key="i" class="skeleton"></div>
      </section>

      <!-- ===== CART ===== -->
      <section
        v-else
        class="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >

        <!-- ================= PRODUCTS ================= -->
        <div class="lg:col-span-2 flex flex-col gap-6">

          <transition-group name="cart">
            <div
              v-for="item in cart.items"
              :key="item.productId"
              class="cart-card"
            >
              <!-- IMAGE -->
              <div class="image-box">
                <img
                  :src="item.images?.[0] || placeholder"
                />

                <span
                  v-if="item.salePrice"
                  class="sale-badge"
                >
                  SALE
                </span>
              </div>

              <!-- INFO -->
              <div class="flex-1 flex flex-col justify-between">

                <div>
                  <h3 class="product-name">
                    {{ item.name }}
                  </h3>

                  <p class="product-price">
                    {{ formatPrice(item.price) }}₫
                  </p>
                </div>

                <!-- QTY -->
                <div class="flex items-center gap-4 mt-4">

                  <button
                    class="qty"
                    :disabled="item.quantity <= 1"
                    @click="updateQuantity(item.productId, item.quantity-1)"
                  >
                    −
                  </button>

                  <span class="qty-number">
                    {{ item.quantity }}
                  </span>

                  <button
                    class="qty qty-plus"
                    @click="updateQuantity(item.productId, item.quantity+1)"
                  >
                    +
                  </button>

                  <button
                    class="remove-btn"
                    @click="removeItem(item.productId)"
                  >
                    🗑 Xóa
                  </button>

                </div>
              </div>

              <!-- TOTAL -->
              <div class="price-total">
                {{ formatPrice(item.price * item.quantity) }}₫
              </div>

            </div>
          </transition-group>

        </div>

        <!-- ================= CHECKOUT ================= -->
        <aside class="checkout-box">

          <h2 class="checkout-title">
            Thanh toán
          </h2>

          <div class="space-y-4 text-gray-600 dark:text-gray-400">

            <div class="row">
              <span>Số sản phẩm</span>
              <b>{{ cart.totalQuantity }}</b>
            </div>

            <div class="row total">
              <span>Tổng tiền</span>
              <span class="price">
                {{ formatPrice(cart.totalPrice) }}₫
              </span>
            </div>

          </div>

          <router-link to="/checkout" class="checkout-btn">
            🚀 Thanh toán ngay
          </router-link>

          <button
            @click="clearCart"
            class="clear-btn"
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

const cart = ref({
  items: [],
  totalQuantity: 0,
  totalPrice: 0
})

const loading = ref(true)
const placeholder = "https://via.placeholder.com/120x160?text=No+Image"

const loadCart = async () => {
  loading.value = true
  try {
    const res = await CartService.getCart()
    cart.value = res || cart.value
  } catch (err) {
    if (err.message === "Chưa đăng nhập") {
      alert("Bạn cần đăng nhập")
      router.push("/user/login")
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
  if (!confirm("Xóa sản phẩm?")) return
  await CartService.removeItem(productId)
  await loadCart()
}

const clearCart = async () => {
  if (!confirm("Xóa toàn bộ giỏ hàng?")) return
  await CartService.clearCart()
  await loadCart()
}

const formatPrice = v =>
  new Intl.NumberFormat("vi-VN").format(v)

onMounted(loadCart)
</script>

<style scoped>

/* ===== EMPTY ===== */

.empty-box{
  text-align:center;
  padding:80px;
  background:white;
  border-radius:30px;
  box-shadow:0 20px 50px rgba(0,0,0,.08);
}

/* ===== SKELETON ===== */

.skeleton{
  height:120px;
  border-radius:20px;
  background:linear-gradient(90deg,#eee,#f5f5f5,#eee);
}

/* ===== CARD ===== */

.cart-card{
  display:flex;
  gap:20px;
  align-items:center;
  padding:20px;
  border-radius:24px;
  background:white;
  transition:.35s;
  box-shadow:0 10px 30px rgba(0,0,0,.07);
}

.cart-card:hover{
  transform:translateY(-6px);
  box-shadow:0 25px 60px rgba(0,0,0,.15);
}

/* ===== IMAGE ===== */

.image-box{
  position:relative;
}

.image-box img{
  width:90px;
  height:110px;
  object-fit:cover;
  border-radius:16px;
}

/* ===== BADGE ===== */

.sale-badge{
  position:absolute;
  top:5px;
  left:5px;
  background:linear-gradient(135deg,#ef4444,#f97316);
  color:white;
  font-size:.7rem;
  font-weight:800;
  padding:3px 8px;
  border-radius:999px;
}

/* ===== TEXT ===== */

.product-name{
  font-weight:800;
  font-size:1.1rem;
}

.product-price{
  color:#dc2626;
  font-weight:bold;
}

/* ===== QTY ===== */

.qty{
  width:34px;
  height:34px;
  border-radius:10px;
  background:#f3f4f6;
  font-weight:bold;
}

.qty-plus{
  background:#f97316;
  color:white;
}

.qty-number{
  font-size:1.1rem;
  font-weight:700;
}

.remove-btn{
  margin-left:15px;
  color:#ef4444;
  font-weight:600;
}

/* ===== TOTAL ===== */

.price-total{
  font-weight:900;
  color:#f97316;
  font-size:1.1rem;
}

/* ===== CHECKOUT ===== */

.checkout-box{
  position:sticky;
  top:30px;
  background:white;
  padding:30px;
  border-radius:28px;
  box-shadow:0 25px 60px rgba(0,0,0,.15);
}

.checkout-title{
  font-size:1.6rem;
  font-weight:900;
}

.row{
  display:flex;
  justify-content:space-between;
}

.total{
  font-size:1.2rem;
}

.price{
  color:#ea580c;
  font-weight:900;
}

/* ===== BUTTON ===== */

.checkout-btn{
  display:block;
  margin-top:20px;
  text-align:center;
  padding:16px;
  border-radius:14px;
  font-weight:800;
  color:white;
  background:linear-gradient(135deg,#f97316,#ec4899);
  transition:.3s;
}

.checkout-btn:hover{
  transform:scale(1.04);
}

.clear-btn{
  margin-top:12px;
  width:100%;
  padding:14px;
  border-radius:14px;
  background:#f3f4f6;
  font-weight:700;
}

/* ===== ANIMATION ===== */

.cart-enter-active,
.cart-leave-active{
  transition:all .4s ease;
}

.cart-enter-from{
  opacity:0;
  transform:translateY(20px);
}

.cart-leave-to{
  opacity:0;
  transform:scale(.8);
}

</style>