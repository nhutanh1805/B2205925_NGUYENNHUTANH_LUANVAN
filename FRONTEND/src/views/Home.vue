<template>
  <div class="min-h-screen bg-light">
    <!-- NÚT DỪNG / CHẠY TẤT CẢ VIDEO -->
    <div class="video-control-global">
      <button
        class="btn btn-dark rounded-pill px-4 py-2 fw-bold"
        @click="toggleAllVideos"
      >
        {{ allPlaying ? "⏸ Dừng tất cả video" : "▶ Phát tất cả video" }}
      </button>
    </div>

<LeftSidebar />

    <!-- SIDEBAR CỐ ĐỊNH BÊN PHẢI  -->
    <aside class="community-sidebar">
      <div class="sidebar-content">
        <h5 class="sidebar-title">
          <i class="bi bi-people-fill me-2"></i>Thông tin liên hệ
        </h5>

        <!-- VIDEO TRAILER NHỎ TRONG SIDEBAR  -->
        <div class="sidebar-video mb-4">
          <video
            ref="sidebarVideoRef"
            :src="sidebarTrailer"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
            class="w-100 rounded-3 shadow-sm"
            style="background: #000"
          >
            Trình duyệt không hỗ trợ video.
          </video>
          <p class="small text-center text-muted mt-2 mb-0">
            Trailer mới nhất 2025
          </p>
        </div>

        <!-- THÔNG TIN LIÊN HỆ -->
        <div class="contact-info" style="font-size: 0.85rem;">
  <div class="contact-item">
    <i class="bi bi-person-fill"></i>
    <div>
      <p class="label">Chủ Shop</p>
      <p class="value">Nhựt Anh</p>
    </div>
  </div>

  <div class="contact-item">
    <i class="bi bi-telephone-fill"></i>
    <div>
      <p class="label">Hotline</p>
      <p class="value">0823 737 258</p>
    </div>
  </div>

  <div class="contact-item">
    <i class="bi bi-envelope-fill"></i>
    <div>
      <p class="label">Email</p>
      <p class="value">nhutanh180504@gmail.com</p>
    </div>
  </div>

  <div class="contact-item">
    <i class="bi bi-geo-alt-fill"></i>
    <div>
      <p class="label">Địa chỉ</p>
      <p class="value">Vĩnh Xuân, Vĩnh Long</p>
    </div>
  </div>

  <div class="contact-item">
    <i class="bi bi-clock-fill"></i>
    <div>
      <p class="label">Giờ làm việc</p>
      <p class="value">08:00 - 22:00 (T2 - CN)</p>
    </div>
  </div>
</div>

      </div>
    </aside>

    <!-- Hero Section -->
    <section
      class="min-vh-100 d-flex align-items-center position-relative overflow-hidden"
      :style="{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <div
        class="position-absolute top-0 start-0 w-100 h-100"
        style="background-color: rgba(0, 0, 0, 0.85)"
      ></div>

      <div class="container position-relative z-2 py-5 text-center text-white">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">
            <span
              class="badge bg-primary bg-gradient fs-5 px-5 py-3 rounded-pill shadow-lg mb-4"
            >
              <i class="bi bi-phone me-2"></i>Hot Deal 2025 - Smartphone Mới
              Nhất<i class="bi bi-phone ms-2"></i>
            </span>

            <h1 class="display-1 fw-bold mb-4">
              TechStore - Điện Thoại Chính Hãng
            </h1>

            <p class="lead fs-2 mb-5">
              iPhone • Samsung • Xiaomi • OPPO • Realme<br />
              Những mẫu điện thoại hot nhất, giá tốt nhất đang chờ bạn
            </p>

            <div
              class="d-flex flex-column flex-sm-row gap-4 justify-content-center"
            >
              <router-link
                to="/products"
                class="btn btn-danger btn-lg px-6 py-4 rounded-pill fw-bold shadow-lg fs-4"
              >
                <i class="bi bi-cart me-2"></i>Mua Ngay
              </router-link>

              <router-link
                to="/products"
                class="btn btn-outline-warning btn-lg px-6 py-4 rounded-pill fw-bold shadow-lg fs-4 text-white"
              >
                Xem Tất Cả Sản Phẩm<i class="bi bi-box-seam ms-2"></i>
              </router-link>
            </div>

            <div class="mt-5">
              <i class="bi bi-phone text-warning fs-2 mx-3"></i>
              <i class="bi bi-battery-full text-success fs-2 mx-3"></i>
              <i class="bi bi-lightning-charge text-primary fs-2 mx-3"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Danh mục -->
    <section class="py-5 bg-white">
      <div class="container py-5">
        <h2 class="text-center fw-bold mb-5">Hãng Nổi Bật</h2>
        <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-4 text-center">
          <div class="col">
            <div class="genre-icon mx-auto mb-2">
              <img
                src="@/assets/img/LogoApple.jpg"
                alt="Apple"
                class="img-fluid rounded-circle"
              />
            </div>
            Apple
          </div>
          <div class="col">
            <div class="genre-icon mx-auto mb-2">
              <img
                src="@/assets/img/LogoSamSung.jpg"
                alt="SamSung"
                class="img-fluid rounded-circle"
              />
            </div>
            SamSung
          </div>
          <div class="col">
            <div class="genre-icon mx-auto mb-2">
              <img
                src="@/assets/img/LogoXiaomi.jpg"
                alt="Xiaomi"
                class="img-fluid rounded-circle"
              />
            </div>
            Xiaomi
          </div>
          <div class="col">
            <div class="genre-icon mx-auto mb-2">
              <img
                src="@/assets/img/LogoViVo.jpg"
                alt="Vivo"
                class="img-fluid rounded-circle"
              />
            </div>
            Vivo
          </div>
          <div class="col">
            <div class="genre-icon mx-auto mb-2">
              <img
                src="@/assets/img/LogoOppo.jpg"
                alt="Oppo"
                class="img-fluid rounded-circle"
              />
            </div>
            Oppo
          </div>
          <div class="col">
            <div class="genre-icon mx-auto mb-2">
              <img
                src="@/assets/img/LogoRealme.jpg"
                alt="Realme"
                class="img-fluid rounded-circle"
              />
            </div>
            Realme
          </div>
        </div>
      </div>
    </section>

    <!-- VIDEO BANNER CHÍNH -->
    <section class="py-5 bg-dark text-white">
      <div class="container text-center">
        <h2 class="fw-bold mb-4">Siêu phẩm SmartPhone mới 2025 đã cập bến!</h2>

        <video
          ref="mainVideoRef"
          class="img-fluid rounded-4 shadow-lg"
          autoplay
          muted
          loop
          playsinline
          style="max-height: 600px; width: 100%; object-fit: cover"
        >
          <source :src="mainVideo" type="video/mp4" />
        </video>

        <p class="mt-3 text-muted">
          Trailer giới thiệu những bộ truyện hot nhất năm 2025
        </p>
      </div>
    </section>

    <!-- VIDEO BANNER NHỎ -->
    <section class="py-5 bg-light">
      <div class="container">
        <h2 class="fw-bold mb-4 text-center">🎬 Video giới thiệu sản phẩm</h2>

        <div class="d-flex flex-wrap gap-3 justify-content-center">
          <div
            v-for="(video, index) in smallVideos"
            :key="index"
            class="small-video-card"
          >
            <video
              :src="video"
              autoplay
              muted
              loop
              playsinline
              class="rounded shadow-sm"
            ></video>
          </div>
        </div>
      </div>
    </section>

    <!-- HIỂN THỊ SẢN PHẨM -->
    <section class="py-6 featured-products">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold display-6 text-white mb-0">🔥 Sản phẩm nổi bật</h2>

          <router-link
            to="/products"
            class="btn btn-outline-light rounded-pill px-4 fw-bold"
          >
            Xem tất cả →
          </router-link>
        </div>

        <div class="featured-scroll">
          <div
            v-for="product in hotProducts"
            :key="product._id"
            class="featured-card"
          >
            <router-link :to="`/products/${product._id}`" class="card-inner">
              <!-- BADGE -->
              <span class="badge-hot">HOT</span>

              <!-- IMAGE -->
              <img
                :src="smallCover(getProductImage(product))"
                alt=""
                class="product-img"
              />

              <!-- INFO -->
              <div class="card-info">
                <h6 class="product-name">
                  {{ product.name }}
                </h6>

                <p class="product-price">
                  {{ product.price?.toLocaleString() }}₫
                </p>

                <p class="product-sold">🔥 Đã bán {{ product.sold || 0 }}</p>

                <button class="btn-buy">Xem chi tiết</button>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import productService from "@/services/product.service";

/* video assets */
import mainVideo from "@/assets/video/BannerMain.mp4";
import sidebarTrailer from "@/assets/video/BannerMain.mp4";
import LeftSidebar from "@/components/LeftSidebar.vue";
// Video banner nhỏ
import smallVideo1 from "@/assets/video/BannerMain.mp4";
import smallVideo2 from "@/assets/video/BannerMain.mp4";
import smallVideo3 from "@/assets/video/BannerMain.mp4";
import smallVideo4 from "@/assets/video/BannerMain.mp4";
import smallVideo5 from "@/assets/video/BannerMain.mp4";
import smallVideo6 from "@/assets/video/BannerMain.mp4";
import smallVideo7 from "@/assets/video/BannerMain.mp4";
import smallVideo8 from "@/assets/video/BannerMain.mp4";
import smallVideo9 from "@/assets/video/BannerMain.mp4";
import smallVideo10 from "@/assets/video/BannerMain.mp4";
import smallVideo11 from "@/assets/video/BannerMain.mp4";
import smallVideo12 from "@/assets/video/BannerMain.mp4";
import heroImage from "@/assets/img/BannerPhone.jpg";
const smallVideos = [
  smallVideo1,
  smallVideo2,
  smallVideo3,
  smallVideo4,
  smallVideo5,
  smallVideo6,
  smallVideo7,
  smallVideo8,
  smallVideo9,
  smallVideo10,
  smallVideo11,
  smallVideo12,
];

const mainVideoRef = ref(null);
const allPlaying = ref(true);
const hotProducts = ref([]);

const toggleAllVideos = () => {
  const videos = [mainVideoRef.value].filter(Boolean);

  if (allPlaying.value) {
    videos.forEach((v) => v.pause());
  } else {
    videos.forEach((v) => v.play());
  }

  allPlaying.value = !allPlaying.value;
};

const productCover = (product) => {
  let url = null;

  if (typeof product.image === "string") {
    url = product.image;
  } else if (product.image?.url) {
    url = product.image.url;
  } else if (Array.isArray(product.image) && product.image[0]?.url) {
    url = product.image[0].url;
  } else if (typeof product.thumbnail === "string") {
    url = product.thumbnail;
  }

  if (!url) return "https://via.placeholder.com/112x160";

  if (url.includes("cloudinary")) {
    return url.replace("/upload/", "/upload/c_fill,w_112,h_160,q_auto,f_auto/");
  }

  return url;
};
const getProductImage = (product) => {
  if (!product) return null;
  if (typeof product.image === "string") return product.image;
  if (typeof product.thumbnail === "string") return product.thumbnail;
  if (Array.isArray(product.images) && typeof product.images[0] === "string")
    return product.images[0];

  if (Array.isArray(product.images)) {
    return product.images[0]?.secure_url || product.images[0]?.url || null;
  }

  return null;
};

const smallCover = (url) => {
  if (!url) return "https://via.placeholder.com/112x160";
  if (url.includes("cloudinary"))
    return url.replace("/upload/", "/upload/c_fill,w_112,h_160,q_auto,f_auto/");
  return url;
};

onMounted(async () => {
  try {
    const res = await productService.getAll({
      limit: 8,
      sortBy: "sold",
      sortOrder: "desc",
    });

    hotProducts.value = (res.products || res).slice(0, 8);
  } catch (err) {
    console.log(err);
  }
});
</script>

<style scoped>
/* ================== GLOBAL ================== */
.video-control-global {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

@media (min-width: 1400px) {
  .video-control-global {
    right: 340px;
  }
}

/* Clamp text */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ================== GENRE ================== */
.genre-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
}

/* ================== SIDEBAR ================== */
.community-sidebar {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 280px;
  display: none;
  z-index: 1000;
}

@media (min-width: 1400px) {
  .community-sidebar {
    display: block;
  }
}

.sidebar-content {
  background: rgba(20, 20, 40, 0.92);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 30px 24px;
  border: 1px solid rgba(138, 43, 226, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  text-align: center;
  transition: 0.4s;
}

.community-sidebar:hover .sidebar-content {
  transform: translateY(-10px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);
}

.sidebar-title {
  color: #ffd700;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 24px;
}

/* Sidebar video */
.sidebar-video video {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.sidebar-video p {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* ================== CONTACT ================== */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.contact-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  transition: 0.3s;
}

.contact-item:hover {
  background: rgba(138, 43, 226, 0.15);
  transform: translateX(-6px);
}

.contact-item i {
  font-size: 1.4rem;
  color: #ffd700;
}

.contact-item .label {
  font-size: 0.8rem;
  color: #aaa;
}

.contact-item .value {
  font-size: 0.95rem;
  color: white;
  font-weight: 500;
}

/* ================== FEATURED PRODUCTS ================== */
.featured-products {
  background: linear-gradient(135deg, #1e1b4b, #020617);
}

.featured-scroll {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.featured-card {
  flex: 0 0 200px;
  scroll-snap-align: start;
}

.card-inner {
  position: relative;
  display: block;
  background: #0f172a;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  transition: 0.35s;
  text-decoration: none;
  color: white;
}

.card-inner:hover {
  transform: translateY(-8px) scale(1.04);
  box-shadow: 0 30px 80px rgba(99, 102, 241, 0.6);
}

.product-img {
  width: 100%;
  height: 260px;
  object-fit: cover;
}

.card-info {
  padding: 14px;
}

.product-name {
  font-weight: 700;
  margin-bottom: 6px;
}

.product-price {
  color: #fde047;
  font-weight: bold;
}

.product-sold {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Button */
.btn-buy {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  border-radius: 999px;
  border: none;
  font-weight: bold;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  opacity: 0;
  transform: translateY(10px);
  transition: 0.3s;
}

.card-inner:hover .btn-buy {
  opacity: 1;
  transform: translateY(0);
}

/* Badge */
.badge-hot {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.small-video-card video {
  width: 180px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.small-video-card video:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}


.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px; /* chiều cao tối đa hiển thị */
  overflow-y: auto;   /* bật scroll dọc khi vượt quá max-height */
  padding-right: 4px; /* để tránh che scrollbar */
}

/* Scrollbar đẹp hơn cho sidebar */
.contact-info::-webkit-scrollbar {
  width: 6px;
}

.contact-info::-webkit-scrollbar-thumb {
  background: rgba(138, 43, 226, 0.6);
  border-radius: 3px;
}

.contact-info::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}


</style>
