<template>
  <div class="max-w-4xl mx-auto p-6" v-if="product">
    <h1 class="text-3xl font-bold mb-6">Chỉnh sửa sản phẩm</h1>

    <form @submit.prevent="submit" class="space-y-6">
      <!-- Thông tin cơ bản -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input v-model="product.name" placeholder="Tên sản phẩm" required class="input" />
        <input v-model="product.slug" placeholder="Slug (iphone-15-pro-max)" required class="input" />
        <input v-model="product.shortDescription" placeholder="Mô tả ngắn" class="input" />
        <input v-model="product.description" placeholder="Mô tả đầy đủ" class="input" />

        <input v-model.number="product.price" type="number" placeholder="Giá gốc" required class="input" />
        <input v-model.number="product.salePrice" type="number" placeholder="Giá khuyến mãi" class="input" />
        <input v-model="product.sku" placeholder="SKU" class="input" />
        <input v-model="product.imei" placeholder="IMEI" class="input" />
        <input v-model.number="product.stock" type="number" placeholder="Số lượng tồn" class="input" />
        <input v-model.number="product.sold" type="number" placeholder="Số lượng đã bán" class="input" />
        <input v-model="product.brand" placeholder="Hãng (Apple, Samsung...)" class="input" />

        <input v-model.number="product.batteryHealth" type="number" placeholder="Battery Health (%)" class="input" />
        <input v-model="product.origin" placeholder="Xuất xứ" class="input" />
        <input v-model.number="product.warrantyMonths" type="number" placeholder="Bảo hành (tháng)" class="input" />
      </div>

      <!-- Specs Nhóm 1 -->
      <div class="mt-4">
        <h2 class="font-semibold mb-2">Thông số cơ bản</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="product.specs.color" placeholder="Màu sắc" class="input" />
          <input v-model="product.specs.storage" placeholder="Dung lượng" class="input" />
          <input v-model="product.specs.ram" placeholder="RAM" class="input" />
          <input v-model="product.specs.screen" placeholder="Màn hình" class="input" />
          <input v-model="product.specs.camera" placeholder="Camera" class="input" />
          <input v-model="product.specs.chip" placeholder="Chip" class="input" />
        </div>
      </div>

      <!-- Specs Nhóm 2 -->
      <div class="mt-4">
        <h2 class="font-semibold mb-2">Thông số nâng cao</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="product.specs.battery" type="number" placeholder="Pin (mAh)" class="input" />
          <input v-model="product.specs.weight" type="number" placeholder="Trọng lượng (g)" class="input" />
          <input v-model="product.specs.bluetooth" placeholder="Bluetooth" class="input" />
          <input v-model="product.specs.wifi" placeholder="WiFi" class="input" />
          <input v-model="product.specs.nfc" placeholder="NFC" class="input" />
        </div>
      </div>

      <!-- Tùy chọn -->
      <div class="flex items-center gap-6 mt-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="product.isFeatured" /> Sản phẩm nổi bật
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="product.isActive" /> Kích hoạt
        </label>
      </div>

      <!-- Upload ảnh -->
      <div class="mt-4">
        <label class="block font-semibold mb-2">Ảnh sản phẩm</label>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-wrap gap-4 cursor-pointer hover:border-blue-500"
          @drop.prevent="handleDrop"
          @dragover.prevent
          @click="$refs.fileInput.click()"
        >
          <div
            v-for="(img, index) in product.images"
            :key="index"
            class="relative w-24 h-24 rounded-lg overflow-hidden border"
          >
            <img :src="img" class="w-full h-full object-cover" />
            <button
              type="button"
              class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              @click.stop="removeImage(index)"
            >
              ×
            </button>
          </div>

          <div class="w-24 h-24 flex items-center justify-center text-gray-400">
            + Thêm
          </div>

          <input
            type="file"
            ref="fileInput"
            multiple
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-xl font-semibold mt-4"
      >
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
const fileInput = ref(null);

onMounted(async () => {
  product.value = await ProductService.get(route.params.id);
  if (!product.value.images) product.value.images = [];
  if (!product.value.specs) product.value.specs = {};
});

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  processFiles(files);
};

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  processFiles(files);
};

const processFiles = (files) => {
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      product.value.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  product.value.images.splice(index, 1);
};

const submit = async () => {
  if (!product.value.images.length) {
    alert("Vui lòng thêm ít nhất 1 ảnh sản phẩm!");
    return;
  }

  try {
    await ProductService.update(route.params.id, product.value);
    alert("Cập nhật sản phẩm thành công!");
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
