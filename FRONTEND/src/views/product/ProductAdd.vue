<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
    <h1 class="text-3xl font-bold mb-6">Thêm sản phẩm mới</h1>

    <form @submit.prevent="submit" class="space-y-6">
      <!-- Thông tin cơ bản -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input v-model="form.name" placeholder="Tên sản phẩm" required class="input" />
        <input v-model="form.slug" placeholder="Slug (iphone-15-pro-max)" required class="input" />
        <input v-model="form.shortDescription" placeholder="Mô tả ngắn" class="input" />
        <input v-model="form.description" placeholder="Mô tả đầy đủ" class="input" />

        <input v-model.number="form.price" type="number" placeholder="Giá gốc" required class="input" />
        <input v-model.number="form.salePrice" type="number" placeholder="Giá khuyến mãi" class="input" />
        <input v-model="form.sku" placeholder="SKU" class="input" />
        <input v-model="form.imei" placeholder="IMEI" class="input" />
        <input v-model.number="form.stock" type="number" placeholder="Số lượng tồn" class="input" />
        <input v-model.number="form.sold" type="number" placeholder="Số lượng đã bán" class="input" />
        <input v-model="form.brand" placeholder="Hãng (Apple, Samsung...)" class="input" />

        <input v-model.number="form.batteryHealth" type="number" placeholder="Battery Health (%)" class="input" />
        <input v-model="form.origin" placeholder="Xuất xứ" class="input" />
        <input v-model.number="form.warrantyMonths" type="number" placeholder="Bảo hành (tháng)" class="input" />
      </div>

      <!-- Specs Nhóm 1 -->
      <div class="mt-4">
        <h2 class="font-semibold mb-2">Thông số cơ bản</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="form.specs.color" placeholder="Màu sắc" class="input" />
          <input v-model="form.specs.storage" placeholder="Dung lượng" class="input" />
          <input v-model="form.specs.ram" placeholder="RAM" class="input" />
          <input v-model="form.specs.screen" placeholder="Màn hình" class="input" />
          <input v-model="form.specs.camera" placeholder="Camera" class="input" />
          <input v-model="form.specs.chip" placeholder="Chip" class="input" />
        </div>
      </div>

      <!-- Specs Nhóm 2 -->
      <div class="mt-4">
        <h2 class="font-semibold mb-2">Thông số nâng cao</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="form.specs.battery" type="number" placeholder="Pin (mAh)" class="input" />
          <input v-model="form.specs.weight" type="number" placeholder="Trọng lượng (g)" class="input" />
          <input v-model="form.specs.bluetooth" placeholder="Bluetooth" class="input" />
          <input v-model="form.specs.wifi" placeholder="WiFi" class="input" />
          <input v-model="form.specs.nfc" placeholder="NFC" class="input" />
        </div>
      </div>

      <!-- Tùy chọn -->
      <div class="flex items-center gap-6 mt-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="form.isFeatured" /> Sản phẩm nổi bật
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="form.isActive" /> Kích hoạt
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
            v-for="(img, index) in form.images"
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
        class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-xl font-semibold mt-4"
      >
        THÊM SẢN PHẨM
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const router = useRouter();

const form = reactive({
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: 0,
  salePrice: 0,
  sku: "",
  imei: "",
  stock: 0,
  sold: 0,
  brand: "",
  images: [],
  specs: {},
  condition: "brand-new",
  batteryHealth: undefined,
  origin: "Việt Nam",
  warrantyMonths: undefined,
  isFeatured: false,
  isActive: true,
});

const fileInput = ref(null);

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
      form.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  form.images.splice(index, 1);
};

const submit = async () => {
  if (!form.images.length) {
    alert("Vui lòng thêm ít nhất 1 ảnh sản phẩm!");
    return;
  }

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
