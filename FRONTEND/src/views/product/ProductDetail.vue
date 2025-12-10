<template>
  <div v-if="product" class="max-w-6xl mx-auto p-6">
    <div class="grid md:grid-cols-2 gap-10">
      <div>
        <img :src="product.images[0]" class="w-full rounded-lg shadow-lg" />
      </div>
      <div>
        <h1 class="text-4xl font-bold mb-4">{{ product.name }}</h1>
        <p class="text-3xl text-red-600 font-bold mb-4">
          {{ formatPrice(product.salePrice || product.price) }}₫
        </p>
        <p v-if="product.salePrice" class="line-through text-gray-500 mb-4">
          {{ formatPrice(product.price) }}₫
        </p>
        <p><strong>Hãng:</strong> {{ product.brand }}</p>
        <p><strong>Tình trạng:</strong> {{ product.condition }}</p>
        <p><strong>Kho:</strong> {{ product.stock }} máy</p>
        <div class="mt-6 space-x-4">
          <router-link :to="`/products/edit/${product._id}`" class="bg-yellow-500 text-white px-6 py-3 rounded">
            Sửa sản phẩm
          </router-link>
          <button @click="router.push('/products')" class="bg-gray-500 text-white px-6 py-3 rounded">
            Quay lại
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProductService from "@/services/product.service";

const route = useRoute();
const product = ref(null);

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

onMounted(async () => {
  try {
    product.value = await ProductService.get(route.params.id);
  } catch (err) {
    alert("Không tìm thấy sản phẩm");
  }
});
</script>