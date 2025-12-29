<template>
  <div class="max-w-4xl mx-auto p-6" v-if="product">
    <h1 class="text-3xl font-bold mb-6">Chỉnh sửa sản phẩm</h1>
    <form @submit.prevent="submit" class="space-y-6">
      <div class="grid grid-cols-2 gap-6">
        <input v-model="product.name" required class="input" />
        <input v-model="product.slug" required class="input" />
        <input v-model.number="product.price" type="number" required class="input" />
        <input v-model.number="product.salePrice" type="number" class="input" />
        <input v-model="product.stock" type="number" class="input" />
        <input v-model="product.brand" class="input" />
      </div>
      <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
        CẬP NHẬT
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const route = useRoute();
const router = useRouter();
const product = ref(null);

onMounted(async () => {
  product.value = await ProductService.get(route.params.id);
});

const submit = async () => {
  await ProductService.update(route.params.id, product.value);
  alert("Cập nhật thành công!");
  router.push("/products");
};
</script>

<style scoped>
.input {@apply border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500;}
</style>