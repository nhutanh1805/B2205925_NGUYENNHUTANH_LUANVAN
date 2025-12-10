<template>
  <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
    <router-link :to="`/products/${product._id}`" class="block relative">
      <img
        :src="product.images?.[0] || 'https://via.placeholder.com/300x300/eeeeee/999999?text=No+Image'"
        alt="product"
        class="w-full h-64 object-contain bg-gray-50 p-6 group-hover:scale-105 transition-transform duration-300"
      />
      <div v-if="product.salePrice && product.salePrice < product.price"
           class="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
        -{{ discountPercent }}%
      </div>
    </router-link>

    <div class="p-5">
      <h3 class="font-bold text-lg text-gray-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition">
        <router-link :to="`/products/${product._id}`">
          {{ product.name }}
        </router-link>
      </h3>

      <div class="mb-4">
        <p class="text-2xl font-bold text-red-600">
          {{ formatPrice(product.salePrice || product.price) }}₫
        </p>
        <p v-if="product.salePrice && product.salePrice < product.price"
           class="text-sm text-gray-500 line-through">
          {{ formatPrice(product.price) }}₫
        </p>
      </div>

      <div class="text-sm text-gray-600 space-y-1">
        <p><strong>Hãng:</strong> {{ product.brand || "Chưa rõ" }}</p>
        <p><strong>Kho:</strong> {{ product.stock }} máy</p>
        <p v-if="product.condition" class="text-green-600 font-medium">
          {{ formatCondition(product.condition) }}
        </p>
      </div>

      <div class="mt-5">
        <router-link
          :to="`/products/${product._id}`"
          class="block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          XEM CHI TIẾT
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const discountPercent = computed(() => {
  if (!props.product.salePrice || !props.product.price) return 0;
  return Math.round(((props.product.price - props.product.salePrice) / props.product.price) * 100);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

const formatCondition = (condition) => {
  const map = {
    "brand-new": "Máy mới 100%",
    "like-new": "Like new 99%",
    "99%": "99% nguyên bản",
    "98%": "98% nguyên bản",
  };
  return map[condition] || condition;
};
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>