<template>
  <div class="rec-wrap">

    <!-- THƯỜNG MUA KÈM -->
    <div v-if="collaborative.length" class="rec-section">
      <div class="rec-header">
        <span class="rec-label">Thường mua kèm</span>
        <h3 class="rec-title">Gợi ý chuyên sâu <span class="ai-badge">✦ AI</span></h3>
      </div>
      <div class="rec-grid">
        <div
          v-for="(product, idx) in collaborative"
          :key="product._id"
          class="rcard"
          :style="`--delay:${idx * 0.06}s`"
          @click="goDetail(product._id)"
        >
          <span v-if="product.salePrice" class="rbadge">-{{ calcDiscount(product) }}%</span>
          <span v-else-if="product.stock === 0" class="rbadge rbadge-out">Hết</span>
          <div class="rcard-img-wrap">
            <img :src="product.images?.[0] || placeholder" :alt="product.name" class="rcard-img" loading="lazy" />
          </div>
          <div class="rcard-body">
            <p class="rcard-brand">{{ product.brand }}</p>
            <h4 class="rcard-name">{{ product.name }}</h4>
            <p v-if="product.aiReason" class="rcard-reason">
              <span class="reason-icon">✦</span> {{ product.aiReason }}
            </p>
            <p v-if="product.coOccurrenceCount > 0" class="rcard-orders">
              Có trong {{ product.coOccurrenceCount }} đơn hàng
            </p>
            <div class="rcard-price-row">
              <span class="rcard-price">{{ formatPrice(product.salePrice || product.price) }}₫</span>
              <span v-if="product.salePrice" class="rcard-origin">{{ formatPrice(product.price) }}₫</span>
            </div>
            <button class="rcard-btn" :class="{ disabled: product.stock === 0 }" :disabled="product.stock === 0" @click.stop="addToCart(product)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="cart-icon">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CÙNG DANH MỤC -->
    <div v-if="sameCategory.length" class="rec-section">
      <div class="rec-header">
        <span class="rec-label">Khám phá thêm</span>
        <h3 class="rec-title">Sản phẩm cùng danh mục <span class="ai-badge">✦ AI</span></h3>
      </div>
      <div class="rec-grid">
        <div
          v-for="(product, idx) in sameCategory"
          :key="product._id"
          class="rcard"
          :style="`--delay:${idx * 0.06}s`"
          @click="goDetail(product._id)"
        >
          <span v-if="product.salePrice" class="rbadge">-{{ calcDiscount(product) }}%</span>
          <span v-else-if="product.stock === 0" class="rbadge rbadge-out">Hết</span>
          <div class="rcard-img-wrap">
            <img :src="product.images?.[0] || placeholder" :alt="product.name" class="rcard-img" loading="lazy" />
          </div>
          <div class="rcard-body">
            <p class="rcard-brand">{{ product.brand }}</p>
            <h4 class="rcard-name">{{ product.name }}</h4>
            <p v-if="product.aiReason" class="rcard-reason">
              <span class="reason-icon">✦</span> {{ product.aiReason }}
            </p>
            <div class="rcard-price-row">
              <span class="rcard-price">{{ formatPrice(product.salePrice || product.price) }}₫</span>
              <span v-if="product.salePrice" class="rcard-origin">{{ formatPrice(product.price) }}₫</span>
            </div>
            <button class="rcard-btn" :class="{ disabled: product.stock === 0 }" :disabled="product.stock === 0" @click.stop="addToCart(product)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="cart-icon">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- HOÀN THIỆN BỘ -->
    <div v-if="bundle.length" class="rec-section">
      <div class="rec-header">
        <span class="rec-label">Hoàn thiện bộ</span>
        <h3 class="rec-title">Gợi ý cho bạn <span class="ai-badge">✦ AI</span></h3>
      </div>
      <div class="rec-grid">
        <div
          v-for="(product, idx) in bundle"
          :key="product._id"
          class="rcard"
          :style="`--delay:${idx * 0.06}s`"
          @click="goDetail(product._id)"
        >
          <span v-if="product.salePrice" class="rbadge">-{{ calcDiscount(product) }}%</span>
          <span v-else-if="product.stock === 0" class="rbadge rbadge-out">Hết</span>
          <div class="rcard-img-wrap">
            <img :src="product.images?.[0] || placeholder" :alt="product.name" class="rcard-img" loading="lazy" />
          </div>
          <div class="rcard-body">
            <p class="rcard-brand">{{ product.brand }}</p>
            <h4 class="rcard-name">{{ product.name }}</h4>
            <p v-if="product.aiReason" class="rcard-reason">
              <span class="reason-icon">✦</span> {{ product.aiReason }}
            </p>
            <div class="rcard-price-row">
              <span class="rcard-price">{{ formatPrice(product.salePrice || product.price) }}₫</span>
              <span v-if="product.salePrice" class="rcard-origin">{{ formatPrice(product.price) }}₫</span>
            </div>
            <button class="rcard-btn" :class="{ disabled: product.stock === 0 }" :disabled="product.stock === 0" @click.stop="addToCart(product)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="cart-icon">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import RecommendationService from "@/services/recommendation.service";
import CartService from "@/services/cart.service";

const props = defineProps({
  productId: { type: String, required: true },
  limit:     { type: Number, default: 4 }
});

const emit = defineEmits(["add-to-cart"]);

const router        = useRouter();
const collaborative = ref([]);
const sameCategory  = ref([]);
const bundle        = ref([]);
const placeholder   = "https://via.placeholder.com/200x260?text=No+Image";

const loadRecommendations = async () => {
  if (!props.productId) return;
  try {
    const res = await RecommendationService.getRecommendations(props.productId, props.limit);
    collaborative.value = res.collaborative || [];
    sameCategory.value  = res.sameCategory  || [];
    bundle.value        = res.bundle        || [];
  } catch {
    collaborative.value = [];
    sameCategory.value  = [];
    bundle.value        = [];
  }
};

watch(() => props.productId, loadRecommendations);
onMounted(loadRecommendations);

const goDetail     = (id) => router.push(`/products/${id}`);
const formatPrice  = (v) => new Intl.NumberFormat("vi-VN").format(v);
const calcDiscount = (p) => Math.round(100 - (p.salePrice / p.price) * 100);

const addToCart = async (product) => {
  try {
    await CartService.addToCart(product._id, 1);
    emit("add-to-cart", product);
  } catch {
    alert("Thêm vào giỏ thất bại!");
  }
};
</script>

<style scoped>
.rec-wrap { margin-top: 48px; padding-top: 36px; border-top: 1.5px solid #e8edf8; }
.rec-section { margin-bottom: 40px; }
.rec-header { margin-bottom: 20px; }
.rec-label {
  display: inline-block;
  font-size: .7rem; font-weight: 700; color: #2563eb;
  text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px;
}
.rec-title {
  font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 0;
  display: flex; align-items: center; gap: 10px;
}
.ai-badge {
  font-size: .65rem; font-weight: 800;
  padding: 3px 10px; border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white; letter-spacing: .06em;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
}
.rec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.rcard {
  position: relative; background: white; border-radius: 18px;
  overflow: hidden; border: 1.5px solid #e8edf8; cursor: pointer;
  transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s, border-color .3s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rcard:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 44px rgba(37,99,235,.14);
  border-color: #a5b4fc;
}
.rbadge {
  position: absolute; top: 8px; left: 8px; z-index: 3;
  font-size: .6rem; font-weight: 800; padding: 3px 8px;
  border-radius: 999px; color: white;
  background: linear-gradient(135deg, #e11d48, #f97316);
  box-shadow: 0 3px 10px rgba(225,29,72,.35);
}
.rbadge-out { background: #94a3b8; box-shadow: none; }
.rcard-img-wrap { height: 170px; background: #f8faff; overflow: hidden; }
.rcard-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
.rcard:hover .rcard-img { transform: scale(1.08); }
.rcard-body { padding: 12px 12px 14px; }
.rcard-brand {
  font-size: .65rem; font-weight: 700; color: #2563eb;
  text-transform: uppercase; letter-spacing: .07em; margin-bottom: 3px;
}
.rcard-name {
  font-size: .83rem; font-weight: 700; color: #0f172a;
  height: 2.5em; overflow: hidden; line-height: 1.3; margin-bottom: 4px;
}
.rcard-reason {
  font-size: .68rem; font-weight: 600; color: #7c3aed;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  border: 1px solid #ddd6fe; border-radius: 8px;
  padding: 5px 8px; margin-bottom: 6px;
  display: flex; align-items: flex-start; gap: 4px; line-height: 1.4;
}
.reason-icon { font-size: .6rem; color: #8b5cf6; flex-shrink: 0; margin-top: 1px; }
.rcard-orders { font-size: .65rem; font-weight: 600; color: #2563eb; margin-bottom: 6px; }
.rcard-price-row { display: flex; align-items: baseline; gap: 5px; margin-bottom: 10px; }
.rcard-price { font-size: .95rem; font-weight: 800; color: #e11d48; }
.rcard-origin { font-size: .72rem; color: #cbd5e1; text-decoration: line-through; }
.rcard-btn {
  width: 100%; padding: 8px 6px; border-radius: 11px;
  font-size: .78rem; font-weight: 700; color: white; border: none; cursor: pointer;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 4px 12px rgba(37,99,235,.28);
  transition: transform .2s, box-shadow .2s;
}
.rcard-btn:hover:not(.disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,99,235,.38); }
.rcard-btn.disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
.cart-icon { width: 13px; height: 13px; flex-shrink: 0; }
@media (max-width: 640px) {
  .rec-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>