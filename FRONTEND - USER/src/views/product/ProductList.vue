<template>
  <div class="products-page min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
    <div class="container mx-auto max-w-7xl px-4 relative">
      <div class="hero-box relative overflow-hidden text-white mb-10 rounded-3xl shadow-2xl">
        <div class="hero-bg"></div>
        <div class="relative z-10 py-14 px-6 text-center">
          <h1 class="text-5xl font-extrabold mb-4 tracking-tight">Quản lý cửa hàng điện thoại</h1>
          <p class="text-xl opacity-90 mb-8">iPhone • Samsung • Xiaomi • Chính hãng • Giá tốt</p>
          <div class="hero-stats">
            <div class="hero-stat"><span class="stat-number">{{ products.length }}</span><span class="stat-label">Sản phẩm</span></div>
            <div class="hero-stat"><span class="stat-number">100%</span><span class="stat-label">Chính hãng</span></div>
            <div class="hero-stat"><span class="stat-number">VN</span><span class="stat-label">Thị trường</span></div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl shadow-xl p-6 sticky top-6 z-20">
        <InputSearch v-model="searchText" @submit="refreshList" class="mb-6"/>
        <h3 class="text-2xl font-bold text-blue-600 mb-4">Danh sách sản phẩm ({{ filteredProductsCount }})</h3>
        <div v-if="filteredProductsCount" class="product-scroll">
          <div v-for="product in filteredProducts" :key="product._id" class="mini-card group">
            <span v-if="product.salePrice" class="badge badge-sale">SALE</span>
            <span v-else-if="product.stock === 0" class="badge badge-out">HẾT HÀNG</span>
            <div class="relative overflow-hidden rounded-2xl mb-3">
              <img :src="product.images?.[0] || placeholder" class="mini-img" @click="goDetail(product._id)"/>
              <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
            </div>
            <h4 class="mini-name" @click="goDetail(product._id)">{{ product.name }}</h4>
            <div class="flex items-center justify-between mb-2">
              <p class="mini-price">{{ formatPrice(product.salePrice || product.price) }}₫</p>
              <span class="mini-stock text-xs">Còn {{ product.stock }}</span>
            </div>
            <button @click.stop="confirmAddToCart(product)" :disabled="product.stock === 0" class="add-to-cart-btn w-full mt-3 py-3 rounded-xl font-bold text-black shadow-lg flex items-center justify-center gap-2" :class="{'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105': product.stock > 0,'bg-gray-400 cursor-not-allowed': product.stock === 0}">
              <i class="fas fa-shopping-cart"></i>
              {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
            </button>
          </div>
        </div>
        <p v-else class="text-center text-gray-500 italic py-12 text-xl">Không tìm thấy sản phẩm nào phù hợp 😢</p>
      </div>
      <transition name="modal">
        <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-3xl p-10 max-w-md w-full mx-4 transform transition-all scale-100">
            <div class="text-center">
              <i class="fas fa-shopping-cart text-6xl text-blue-600 mb-6"></i>
              <h2 class="text-3xl font-black mb-4">Xác nhận thêm vào giỏ</h2>
              <p class="text-xl text-gray-700 dark:text-gray-300 mb-8">Bạn có muốn thêm <span class="font-bold text-blue-600">"{{ pendingProduct.name }}"</span> vào giỏ hàng không?</p>
              <div class="flex gap-6 justify-center">
                <button @click="cancelAdd" class="px-10 py-4 bg-gray-400 hover:bg-gray-500 text-black font-bold rounded-2xl transition-all hover:scale-105">Hủy</button>
                <button @click="executeAddToCart" class="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-black font-bold rounded-2xl transition-all hover:scale-105 shadow-xl">Có, thêm ngay!</button>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <transition name="toast">
        <div v-if="showToast" class="fixed top-6 right-6 z-50">
          <div class="bg-gray-900 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-5 animate-fade-in">
            <i class="fas fa-check-circle text-green-400 text-3xl"></i>
            <div>
              <p class="font-bold text-lg">localhost thông báo:</p>
              <p class="text-base opacity-90">Đã thêm "{{ toastMessage }}" vào giỏ hàng</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue"
import { useRouter } from "vue-router"
import ProductService from "@/services/product.service"
import CartService from "@/services/cart.service"
import InputSearch from "@/components/InputSearch.vue"

const router = useRouter()

const products = ref([])
const searchText = ref("")
const placeholder = "https://via.placeholder.com/112x160?text=No+Image"
const showConfirm = ref(false)
const pendingProduct = ref(null)
const showToast = ref(false)
const toastMessage = ref("")

onMounted(async () => {
  await refreshList()
  nextTick(initDragScroll)
})

function goDetail(id) {
  router.push(`/products/${id}`)
}

async function refreshList() {
  const res = await ProductService.getAll()
  products.value = res.products || res
}

const productStrings = computed(() => products.value.map(p => `${p.name}${p.brand}${p.imei || ""}`.toLowerCase()))
const filteredProducts = computed(() => !searchText.value ? products.value : products.value.filter((_, i) => productStrings.value[i].includes(searchText.value.toLowerCase())))
const filteredProductsCount = computed(() => filteredProducts.value.length)
const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v)

function confirmAddToCart(product) {
  if (product.stock === 0) return
  pendingProduct.value = product
  showConfirm.value = true
}

function cancelAdd() {
  showConfirm.value = false
  pendingProduct.value = null
}

async function executeAddToCart() {
  showConfirm.value = false
  try {
    await CartService.addToCart(pendingProduct.value._id, 1)
    toastMessage.value = pendingProduct.value.name
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 4000)
  } catch {
    alert("Thêm vào giỏ hàng thất bại!")
  }
  pendingProduct.value = null
}

function initDragScroll() {
  const el = document.querySelector(".product-scroll")
  if (!el) return
  let isDown = false, startX = 0, scrollLeft = 0
  el.addEventListener("mousedown", e => {
    isDown = true
    el.classList.add("dragging")
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
  })
  el.addEventListener("mouseleave", () => { isDown = false; el.classList.remove("dragging") })
  el.addEventListener("mouseup", () => { isDown = false; el.classList.remove("dragging") })
  el.addEventListener("mousemove", e => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX) * 2
    el.scrollLeft = scrollLeft - walk
  })
}
</script>

<style scoped>
.hero-box { background: linear-gradient(135deg, #2563eb, #7c3aed); }
.hero-bg { position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.2), transparent 40%), radial-gradient(circle at 50% 100%, rgba(0,0,0,.2), transparent 50%); filter: blur(20px); }
.hero-stats { display: flex; justify-content: center; gap: 32px; margin-top: 8px; }
.hero-stat { backdrop-filter: blur(12px); background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); border-radius: 16px; padding: 14px 22px; min-width: 110px; }
.stat-number { display: block; font-size: 1.6rem; font-weight: 800; }
.stat-label { font-size: .75rem; opacity: .85; letter-spacing: .05em; }
.product-scroll { display: flex; gap: 20px; overflow-x: auto; padding: 8px 0 20px; scroll-snap-type: x mandatory; cursor: grab; }
.product-scroll.dragging { cursor: grabbing; }
.product-scroll::-webkit-scrollbar { height: 8px; }
.product-scroll::-webkit-scrollbar-thumb { background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 4px; }
.mini-card { position: relative; flex: 0 0 180px; background: white; border-radius: 20px; padding: 16px; text-align: center; cursor: pointer; border: 1px solid #e5e7eb; scroll-snap-align: center; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.mini-card:hover { transform: translateY(-12px) scale(1.03); box-shadow: 0 25px 50px rgba(59,130,246,0.25); border-color: #3b82f6; }
.mini-img { width: 148px; height: 200px; object-fit: cover; border-radius: 16px; margin-bottom: 12px; transition: transform 0.4s ease; }
.mini-card:hover .mini-img { transform: scale(1.08); }
.mini-name { font-size: 0.95rem; font-weight: 700; height: 2.8em; overflow: hidden; margin-bottom: 8px; line-height: 1.4; }
.mini-price { font-size: 1.1rem; font-weight: bold; color: #dc2626; margin-bottom: 4px; }
.mini-stock { font-size: 0.8rem; color: #6b7280; margin-bottom: 12px; }
.badge { position: absolute; top: 12px; left: 12px; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; color: white; z-index: 10; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.badge-sale { background: linear-gradient(135deg, #ef4444, #f97316); }
.badge-out { background: #6b7280; }
.add-to-cart-btn { font-size: 0.9rem; transition: all 0.3s ease; }
.add-to-cart-btn:hover { transform: scale(1.03); }
.modal-enter-active, .modal-leave-active { transition: all 0.4s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .bg-black { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.8); }
.toast-enter-active { animation: toastInTop 0.6s ease; }
.toast-leave-active { animation: toastOutTop 0.4s ease forwards; }
@keyframes toastInTop { 0% { opacity: 0; transform: translateY(-50px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes toastOutTop { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-30px); } }
.animate-fade-in { animation: toastInTop 0.6s ease; }
</style>
