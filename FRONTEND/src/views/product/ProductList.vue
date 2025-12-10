<template>
  <div class="products-page py-8 min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <div class="container mx-auto px-4 max-w-7xl">

      <!-- Hero Box -->
      <div class="hero-box text-center text-white py-10 mb-8 rounded-3xl shadow-2xl bg-gradient-to-r from-blue-600 to-purple-700">
        <h2 class="text-5xl font-extrabold mb-4 drop-shadow-lg">
          Quản lý cửa hàng điện thoại
        </h2>
        <p class="text-2xl font-light opacity-90">
          iPhone – Samsung – Xiaomi – Chính hãng 100% – Giá tốt nhất Việt Nam
        </p>
      </div>

      <div class="grid lg:grid-cols-12 gap-8">

        <!-- Cột trái: Danh sách + tìm kiếm + nút chức năng -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-3xl shadow-xl p-6 sticky top-6">

            <!-- Ô tìm kiếm -->
            <InputSearch v-model="searchText" @submit="refreshList" class="mb-6" />

            <h4 class="text-2xl font-bold text-blue-600 mb-6 flex items-center">
              Danh sách sản phẩm ({{ filteredProductsCount }})
            </h4>

            <!-- Danh sách sản phẩm dạng list (nhỏ gọn) -->
            <div v-if="filteredProductsCount > 0" class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="(product, index) in filteredProducts"
                :key="product._id"
                @click="activeIndex = index"
                :class="[
                  'p-4 rounded-xl cursor-pointer transition-all border-2',
                  activeIndex === index
                    ? 'bg-blue-100 border-blue-500 shadow-lg'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center gap-4">
                  <img
                    :src="product.images?.[0] || 'https://via.placeholder.com/60'"
                    class="w-16 h-16 object-cover rounded-lg"
                  />
                  <div class="flex-1">
                    <h5 class="font-semibold text-gray-800 line-clamp-1">
                      {{ product.name }}
                    </h5>
                    <p class="text-sm text-gray-600">
                      {{ product.brand }} • {{ product.stock }} máy
                    </p>
                  </div>
                  <p class="text-lg font-bold text-red-600">
                    {{ formatPrice(product.salePrice || product.price) }}₫
                  </p>
                </div>
              </div>
            </div>

            <p v-else class="text-center text-gray-500 py-10 italic">
              Không có sản phẩm nào khớp
            </p>

            <!-- Các nút chức năng -->
            <div class="flex flex-wrap gap-3 mt-8 justify-center">
              <button @click="refreshList" class="btn btn-primary">
                Làm mới
              </button>
              <router-link to="/products/add" class="btn btn-success">
                Thêm mới
              </router-link>
              <button @click="removeAllProducts" class="btn btn-danger">
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>

        <!-- Cột phải: Chi tiết sản phẩm -->
        <div class="lg:col-span-7" v-if="activeProduct">
          <div class="bg-white rounded-3xl shadow-2xl p-8">
            <h4 class="text-3xl font-bold text-blue-600 mb-6 flex items-center">
              Chi tiết sản phẩm
            </h4>

            <div class="grid md:grid-cols-2 gap-8">
              <!-- Ảnh lớn -->
              <div>
                <img
                  :src="activeProduct.images?.[0] || 'https://via.placeholder.com/500'"
                  class="w-full rounded-2xl shadow-lg"
                />
              </div>

              <!-- Thông tin -->
              <div class="space-y-5">
                <h2 class="text-3xl font-extrabold text-gray-800">
                  {{ activeProduct.name }}
                </h2>

                <div class="text-4xl font-bold text-red-600">
                  {{ formatPrice(activeProduct.salePrice || activeProduct.price) }}₫
                  <span v-if="activeProduct.salePrice" class="text-lg text-gray-500 line-through ml-4">
                    {{ formatPrice(activeProduct.price) }}₫
                  </span>
                </div>

                <div class="space-y-3 text-lg">
                  <p><strong>Hãng:</strong> {{ activeProduct.brand }}</p>
                  <p><strong>Tình trạng:</strong> 
                    <span class="text-green-600 font-bold">
                      {{ formatCondition(activeProduct.condition) }}
                    </span>
                  </p>
                  <p><strong>Tồn kho:</strong> {{ activeProduct.stock }} máy</p>
                  <p><strong>IMEI:</strong> {{ activeProduct.imei || "Không có" }}</p>
                  <p><strong>Bảo hành:</strong> {{ activeProduct.warrantyMonths }} tháng</p>
                  <p><strong>Xuất xứ:</strong> {{ activeProduct.origin }}</p>
                </div>

                <div class="flex gap-4 mt-8">
                  <router-link
                    :to="`/products/edit/${activeProduct._id}`"
                    class="btn btn-warning flex-1 text-center"
                  >
                    Chỉnh sửa
                  </router-link>
                  <button class="btn btn-primary flex-1">
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>

            <!-- Thông số kỹ thuật -->
            <div class="mt-10 bg-gray-50 rounded-2xl p-6">
              <h3 class="text-2xl font-bold mb-4 text-gray-800">Thông số kỹ thuật</h3>
              <div class="grid grid-cols-2 gap-4 text-lg">
                <p><strong>Màn hình:</strong> {{ activeProduct.specs.screen || "N/A" }}</p>
                <p><strong>Chip:</strong> {{ activeProduct.specs.chip || "N/A" }}</p>
                <p><strong>RAM:</strong> {{ activeProduct.specs.ram || "N/A" }}</p>
                <p><strong>Bộ nhớ:</strong> {{ activeProduct.specs.storage || "N/A" }}</p>
                <p><strong>Camera:</strong> {{ activeProduct.specs.camera || "N/A" }}</p>
                <p><strong>Pin:</strong> {{ activeProduct.specs.battery || "N/A" }}</p>
                <p><strong>Màu:</strong> {{ activeProduct.specs.color || "N/A" }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nút về trang chủ -->
      <div class="text-center mt-12">
        <router-link to="/" class="btn btn-outline-primary text-xl px-10 py-4">
          Quay về Trang chủ
        </router-link>
        <p class="text-gray-600 mt-4 text-lg italic">
          “Công nghệ không ngừng thay đổi – nhưng chất lượng mãi là vĩnh cửu.”
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProductService from "@/services/product.service";
import InputSearch from "@/components/InputSearch.vue";

const router = useRouter();
const products = ref([]);
const searchText = ref("");
const activeIndex = ref(-1);

onMounted(() => {
  refreshList();
});

const refreshList = async () => {
  try {
    const res = await ProductService.getAll();
    products.value = res.products || res;
    activeIndex.value = -1;
  } catch (err) {
    alert("Lỗi tải dữ liệu!");
  }
};

const removeAllProducts = async () => {
  if (confirm("Bạn có chắc muốn xóa TẤT CẢ sản phẩm?")) {
    await ProductService.deleteAll();
    refreshList();
  }
};

const productStrings = computed(() => {
  return products.value.map(p => 
    `${p.name}${p.brand}${p.sku}${p.imei}${p.specs.storage || ""}${p.specs.color || ""}`.toLowerCase()
  );
});

const filteredProducts = computed(() => {
  if (!searchText.value) return products.value;
  return products.value.filter((_, i) =>
    productStrings.value[i].includes(searchText.value.toLowerCase())
  );
});

const filteredProductsCount = computed(() => filteredProducts.value.length);
const activeProduct = computed(() => 
  activeIndex.value >= 0 ? filteredProducts.value[activeIndex.value] : null
);

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);
const formatCondition = (c) => {
  const map = { "brand-new": "Máy mới 100%", "like-new": "Like new 99%" };
  return map[c] || c;
};
</script>

<style scoped>
.products-page { font-family: 'Poppins', sans-serif; }
.hero-box { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
.btn {
  @apply px-5 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl;
}
.btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
.btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
.btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }
.btn-warning { @apply bg-yellow-500 text-white hover:bg-yellow-600; }
.btn-outline-primary { @apply border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white; }
</style>