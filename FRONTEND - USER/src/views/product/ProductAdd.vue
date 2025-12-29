<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
    <h1 class="text-3xl font-bold mb-6">Thêm sản phẩm mới</h1>
    <form @submit.prevent="submit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input v-model="form.name" placeholder="Tên sản phẩm" required class="input" />
        <input v-model="form.slug" placeholder="Slug (iphone-15-pro-max)" required class="input" />
        <input v-model.number="form.price" type="number" placeholder="Giá gốc" required class="input" />
        <input v-model.number="form.salePrice" type="number" placeholder="Giá khuyến mãi" class="input" />
        <input v-model="form.sku" placeholder="SKU" class="input" />
        <input v-model="form.imei" placeholder="IMEI" class="input" />
        <input v-model.number="form.stock" type="number" placeholder="Số lượng tồn" class="input" />
        <input v-model="form.brand" placeholder="Hãng (Apple, Samsung...)" class="input" />
        <input v-model="form.images[0]" placeholder="Link ảnh chính" class="input col-span-2" />
      </div>

      <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-xl font-semibold">
        THÊM SẢN PHẨM
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const router = useRouter();
const form = reactive({
  name: "", slug: "", price: 0, salePrice: 0, sku: "", imei: "", stock: 0,
  brand: "", images: [""], specs: {}, condition: "brand-new"
});

const submit = async () => {
  try {
    await ProductService.create(form);
    alert("Thêm sản phẩm thành công!");
    router.push("/products");
  } catch (err) {
    alert("Lỗi: " + (err.response?.data?.message || err.message));
  }
};
</script>

<style scoped>
.input {
  @apply border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500;
}
</style>