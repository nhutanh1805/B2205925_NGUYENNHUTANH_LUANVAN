<template>
  <div class="min-h-screen bg-light">

    <!-- Hero Section -->
    <section class="bg-gradient-primary text-white position-relative overflow-hidden py-5">
      <div class="bg-dark opacity-50 position-absolute top-0 start-0 w-100 h-100"></div>
      <div class="container position-relative py-5">
        <div class="row justify-content-center text-center py-5">
          <div class="col-lg-10">
            <h1 class="display-3 fw-bold mb-4">PhoneStore 2025</h1>
            <p class="lead fs-3 mb-5 opacity-90">Điện thoại chính hãng – Giá tốt nhất Việt Nam</p>
            <div class="d-flex flex-column flex-sm-row gap-4 justify-content-center">
              <router-link to="/products" class="btn btn-light btn-lg px-5 py-4 rounded-pill shadow-lg fw-bold fs-5">
                MUA NGAY
              </router-link>
              <button class="btn btn-outline-light btn-lg px-5 py-4 rounded-pill fw-bold fs-5">
                Xem khuyến mãi
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="position-absolute bottom-0 start-0 end-0">
        <svg viewBox="0 0 1440 120" class="w-100 fill-light">
          <path d="M0,0 L1440,0 L1440,120 L0,60 Z"></path>
        </svg>
      </div>
    </section>

    <!-- Featured Brands -->
    <section class="py-5 bg-white">
      <div class="container py-5">
        <h2 class="text-center display-5 fw-bold mb-5 text-dark">Thương hiệu nổi bật</h2>
        <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-4 justify-content-center">
          <div class="col text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_Apple.svg" class="img-fluid" style="height:60px" alt="Apple"></div>
          <div class="col text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" class="img-fluid" style="height:60px" alt="Samsung"></div>
          <div class="col text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Xiaomi_logo.svg" class="img-fluid" style="height:70px" alt="Xiaomi"></div>
          <div class="col text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Oppo_logo_2019.svg" class="img-fluid" style="height:60px" alt="Oppo"></div>
          <div class="col text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Vivo_logo_2019.svg" class="img-fluid" style="height:60px" alt="Vivo"></div>
          <div class="col text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/9/9e/Google_Pixel_logo.svg" class="img-fluid" style="height:55px" alt="Google Pixel"></div>
        </div>
      </div>
    </section>

    <!-- Hot Products -->
    <section class="py-5 bg-light">
      <div class="container py-5">
        <h2 class="text-center display-5 fw-bold mb-5 text-dark">Sản phẩm bán chạy</h2>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
          <div v-for="product in hotProducts" :key="product._id" class="col">
            <ProductCard :product="product" />
          </div>
        </div>
        <div class="text-center mt-5">
          <router-link to="/products" class="btn btn-primary btn-lg px-5 py-4 rounded-pill shadow-lg fw-bold fs-5">
            Xem tất cả sản phẩm
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-5 bg-white">
      <div class="container py-5">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-5 text-center">
          <div class="col">
            <div class="text-primary fs-1 mb-3"><i class="fas fa-truck"></i></div>
            <h3 class="h4 fw-bold">Miễn phí vận chuyển</h3>
            <p class="text-muted">Toàn quốc từ 2 triệu</p>
          </div>
          <div class="col">
            <div class="text-primary fs-1 mb-3"><i class="fas fa-shield-alt"></i></div>
            <h3 class="h4 fw-bold">Bảo hành chính hãng</h3>
            <p class="text-muted">12-24 tháng, 1 đổi 1</p>
          </div>
          <div class="col">
            <div class="text-primary fs-1 mb-3"><i class="fas fa-credit-card"></i></div>
            <h3 class="h4 fw-bold">Trả góp 0%</h3>
            <p class="text-muted">Chỉ cần CMND/CCCD</p>
          </div>
          <div class="col">
            <div class="text-primary fs-1 mb-3"><i class="fas fa-headset"></i></div>
            <h3 class="h4 fw-bold">Hỗ trợ 24/7</h3>
            <p class="text-muted">Hotline & Zalo luôn online</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="bg-gradient-primary text-white py-5">
      <div class="container text-center py-5">
        <h2 class="display-4 fw-bold mb-4">Sẵn sàng sở hữu siêu phẩm?</h2>
        <p class="lead mb-5">Giá tốt nhất – Giao hàng nhanh nhất – Bảo hành dài nhất</p>
        <router-link to="/products" class="btn btn-light btn-lg px-5 py-4 rounded-pill shadow-lg fw-bold fs-4">
          MUA SẮM NGAY
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ProductService from "@/services/product.service";
import ProductCard from "@/components/ProductCard.vue";

const hotProducts = ref([]);

onMounted(async () => {
  try {
    const res = await ProductService.getAll({ limit: 8, sortBy: "sold", sortOrder: "desc" });
    hotProducts.value = (res.products || res).slice(0, 8);
  } catch (err) {
    console.log(err);
  }
});
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>