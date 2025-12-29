<template>
  <div v-if="product" class="max-w-7xl mx-auto p-6 bg-white min-h-screen">
    <nav class="mb-6 text-sm text-gray-600">
      <router-link to="/products" class="hover:text-blue-600">Danh sách</router-link>
      <span class="mx-2">/</span>
      <span class="font-medium">{{ product.name }}</span>
    </nav>

    <div class="grid lg:grid-cols-3 gap-10">
      <div class="lg:col-span-2">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <img
            :src="product.images[0]"
            class="rounded-2xl shadow-xl w-full h-80 object-cover cursor-pointer hover:opacity-90 transition"
            @click="currentImage = product.images[0]"
          />
          <div v-for="(img, i) in product.images.slice(1, 3)" :key="i" class="rounded-xl shadow-md overflow-hidden">
            <img :src="img" class="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition" @click="currentImage = img" />
          </div>
        </div>
        <img :src="currentImage" class="w-full rounded-2xl shadow-2xl" />
      </div>

      <div class="space-y-6">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
          <div class="flex items-baseline space-x-4 mb-4">
            <p class="text-5xl font-bold text-red-600">
              {{ formatPrice(product.salePrice || product.price) }}₫
            </p>
            <p v-if="product.salePrice" class="text-2xl text-gray-500 line-through">
              {{ formatPrice(product.price) }}₫
            </p>
          </div>
          <span v-if="product.salePrice" class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
            Giảm {{ discountPercent }}%
          </span>
        </div>

        <div class="space-y-3 text-lg">
          <div class="flex justify-between">
            <span class="text-gray-600">Hãng:</span>
            <span class="font-semibold text-blue-600">{{ product.brand }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Tình trạng:</span>
            <span class="text-green-600 font-bold">{{ formatCondition(product.condition) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Tồn kho:</span>
            <span class="font-semibold">{{ product.stock }} máy</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">IMEI:</span>
            <span class="font-mono">{{ product.imei || "N/A" }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Bảo hành:</span>
            <span class="font-bold">{{ product.warrantyMonths }} tháng</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Xuất xứ:</span>
            <span class="font-semibold">{{ product.origin }}</span>
          </div>
        </div>

        <div class="space-y-4">
          <router-link
            to="/products/add"
            class="block w-full text-center bg-green-600 text-black py-4 rounded-xl text-xl font-bold hover:bg-green-700 transition shadow-lg"
          >
            Thêm sản phẩm mới
          </router-link>

          <button class="w-full bg-blue-600 text-black py-4 rounded-xl text-xl font-bold hover:bg-blue-700 transition shadow-lg">
            Thêm vào giỏ hàng
          </button>
          <button class="w-full bg-green-600 text-black py-4 rounded-xl text-xl font-bold hover:bg-green-700 transition shadow-lg">
            Mua ngay
          </button>
          <router-link
            :to="`/products/edit/${product._id}`"
            class="block w-full text-center bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-600 transition text-lg shadow-lg"
          >
            Sửa sản phẩm
          </router-link>
          <button
            @click="deleteProduct"
            class="w-full bg-red-600 text-black py-3 rounded-xl font-bold hover:bg-red-700 transition text-lg shadow-lg"
          >
            Xóa sản phẩm
          </button>
          <router-link
            to="/products"
            class="block w-full text-center bg-gray-600 text-black py-3 rounded-xl font-bold hover:bg-gray-700 transition text-lg shadow-lg"
          >
            Quay lại danh sách
          </router-link>
        </div>
      </div>
    </div>

    <div class="mt-16 bg-gray-50 rounded-2xl p-8">
      <h2 class="text-3xl font-bold text-gray-800 mb-8">Thông số kỹ thuật</h2>
      <div class="grid md:grid-cols-3 gap-6 text-lg">
        <div>
          <h3 class="font-bold text-gray-700 mb-3">Màn hình</h3>
          <p>{{ product.specs.screen || "N/A" }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-700 mb-3">Chip xử lý</h3>
          <p>{{ product.specs.chip || "N/A" }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-700 mb-3">RAM</h3>
          <p>{{ product.specs.ram || "N/A" }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-700 mb-3">Bộ nhớ</h3>
          <p>{{ product.specs.storage || "N/A" }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-700 mb-3">Camera</h3>
          <p>{{ product.specs.camera || "N/A" }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-700 mb-3">Pin</h3>
          <p>{{ product.specs.battery || "N/A" }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <h2 class="text-4xl font-bold text-gray-500 mb-4">Sản phẩm không tồn tại</h2>
    <router-link to="/products" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
      Quay lại danh sách
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const route = useRoute();
const router = useRouter();
const product = ref(null);
const currentImage = ref("");

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

const discountPercent = computed(() => {
  if (!product.value?.salePrice || !product.value?.price) return 0;
  return Math.round(((product.value.price - product.value.salePrice) / product.value.price) * 100);
});

const formatCondition = (c) => {
  const map = {
    "brand-new": "Máy mới 100%",
    "like-new": "Like new 99%",
    "99%": "99% nguyên bản",
    "98%": "98% nguyên bản",
  };
  return map[c] || c;
};

const deleteProduct = async () => {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    try {
      await ProductService.delete(product.value._id);
      alert("Xóa thành công!");
      router.push("/products");
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm: " + err.message);
    }
  }
};

onMounted(async () => {
  try {
    product.value = await ProductService.get(route.params.id);
    currentImage.value = product.value.images[0];
  } catch (err) {
    console.error(err);
  }
});
</script>