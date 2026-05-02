<template>
  <div class="min-h-screen bg-light">
    <!-- Nút điều khiển video -->
    <div class="video-control-global-left">
      <button
        class="btn btn-dark rounded-pill px-4 py-2 fw-bold"
        @click="toggleAllVideos"
      >
        {{ allPlaying ? "⏸ Dừng tất cả video" : "▶ Phát tất cả video" }}
      </button>
    </div>

    <!--<CommunitySidebar />-->

    <!-- HERO -->
    <section
      class="min-vh-100 d-flex align-items-center position-relative overflow-hidden"
      :style="{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <div class="position-absolute top-0 start-0 w-100 h-100"
        style="background-color: rgba(0, 0, 0, 0.85)">
      </div>

      <div class="container position-relative z-2 py-5 text-center text-white">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">

            <span class="badge bg-primary bg-gradient fs-5 px-5 py-3 rounded-pill shadow-lg mb-4">
              🔌 Hot Deal 2025 - Phụ Kiện Điện Thoại
            </span>

            <h1 class="display-1 fw-bold mb-4">
              TechStore - Phụ Kiện Điện Thoại Chính Hãng
            </h1>

            <p class="lead fs-2 mb-5">
              Ốp lưng • Sạc nhanh • Cáp Type-C • Tai nghe • Pin dự phòng<br />
              Phụ kiện hot nhất, giá tốt nhất đang chờ bạn
            </p>

            <div class="d-flex flex-column flex-sm-row gap-4 justify-content-center">

              <router-link
                to="/products"
                class="btn btn-danger btn-lg px-6 py-4 rounded-pill fw-bold shadow-lg fs-4"
              >
                🛒 Mua Phụ Kiện Ngay
              </router-link>

              <router-link
                to="/products"
                class="btn btn-outline-warning btn-lg px-6 py-4 rounded-pill fw-bold shadow-lg fs-4 text-white"
              >
                Xem Tất Cả Phụ Kiện
              </router-link>

            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- DANH MỤC -->
    <section class="py-5 bg-white">
      <div class="container py-5">
        <h2 class="text-center fw-bold mb-5">Danh Mục Phụ Kiện</h2>

        <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-4 text-center">

          <div class="col" v-for="brand in brands" :key="brand.name">
            <div class="genre-icon mx-auto mb-2">
              <img :src="brand.logo" :alt="brand.name" class="img-fluid rounded-circle"/>
            </div>
            {{ brand.name }}
          </div>

        </div>
      </div>
    </section>

    <!-- VIDEO CHÍNH -->
    <section class="py-5 bg-dark text-white">
      <div class="container text-center">

        <h2 class="fw-bold mb-4">
          🔥 Phụ kiện công nghệ mới 2025 đã có mặt!
        </h2>

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
          Video giới thiệu phụ kiện điện thoại hot nhất
        </p>

      </div>
    </section>

    <!-- VIDEO NHỎ -->
    <section class="py-5 bg-light">
      <div class="container">
        <h2 class="fw-bold mb-4 text-center">
          🎬 Video phụ kiện nổi bật
        </h2>

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

    <!-- SẢN PHẨM -->
    <section class="py-6 featured-products">
      <div class="container">

        <div class="d-flex justify-content-between align-items-center mb-4">

          <h2 class="fw-bold display-6 text-white mb-0">
            🔥 Phụ kiện nổi bật
          </h2>

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

              <span class="badge-hot">HOT</span>

              <img
                :src="smallCover(getProductImage(product))"
                class="product-img"
              />

              <div class="card-info">

                <h6 class="product-name">{{ product.name }}</h6>

                <p class="product-price">
                  {{ product.price?.toLocaleString() }}₫
                </p>

                <p class="product-sold">
                  🔥 Đã bán {{ product.sold || 0 }}
                </p>

                <button class="btn-buy">
                  Xem chi tiết
                </button>

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
import mainVideo from "@/assets/video/Banner Chính.mp4";
import CommunitySidebar from "@/components/sidebar/CommunitySidebar.vue";
import heroImage from "@/assets/img/Banner Hero.png";
/* Video phụ */
const smallVideos = Array(12).fill(mainVideo);

/* Nút điều khiển video */
const mainVideoRef = ref(null);
const allPlaying = ref(true);

/* Toggle video chính + 12 video nhỏ */
const toggleAllVideos = () => {
  // Chọn video chính
  const videos = [];
  if (mainVideoRef.value) videos.push(mainVideoRef.value);

  // Chọn 12 video nhỏ
  const smallVideoElements = document.querySelectorAll(
    ".small-video-card video"
  );
  smallVideoElements.forEach((v) => videos.push(v));

  if (allPlaying.value) videos.forEach((v) => v.pause());
  else videos.forEach((v) => v.play());

  allPlaying.value = !allPlaying.value;
};

/* Import trực tiếp ảnh hãng */
import TaiNghe from "@/assets/img/Tai nghe.jpg";
import CuSac from "@/assets/img/Củ sạc.jpg";
import CapSac from "@/assets/img/Cáp sạc.jpg";
import KinhCuongLuc from "@/assets/img/Kính cường lực.jpg";
import PinDuPhong from "@/assets/img/Pin dự phòng.jpg";
import SacKhongDay from "@/assets/img/Sạc không dây.jpg";

/* Danh sách brands */
const brands = [
  { name: "Tai Nghe", logo: TaiNghe },
  { name: "Củ sạc", logo: CuSac },
  { name: "Cáp sạc", logo: CapSac },
  { name: "Kính cường lực", logo: KinhCuongLuc },
  { name: "Pin dự phòng", logo: PinDuPhong },
  { name: "Sạc không dây", logo: SacKhongDay },
];

/* Sản phẩm nổi bật */
const hotProducts = ref([]);

const productCover = (product) => {
  if (!product) return "https://via.placeholder.com/112x160";
  let url = product.image?.url || product.thumbnail || product.image || null;
  if (!url) return "https://via.placeholder.com/112x160";
  if (url.includes("cloudinary"))
    return url.replace("/upload/", "/upload/c_fill,w_112,h_160,q_auto,f_auto/");
  return url;
};

const getProductImage = (product) => {
  if (!product) return null;
  if (typeof product.image === "string") return product.image;
  if (typeof product.thumbnail === "string") return product.thumbnail;
  if (Array.isArray(product.images))
    return (
      product.images[0]?.secure_url ||
      product.images[0]?.url ||
      product.images[0]
    );
  return null;
};

const smallCover = (url) => {
  if (!url) return "https://via.placeholder.com/112x160";
  if (url.includes("cloudinary"))
    return url.replace("/upload/", "/upload/c_fill,w_112,h_160,q_auto,f_auto/");
  return url;
};

/* Lấy sản phẩm hot */
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
/* VIDEO CONTROL LEFT */
.video-control-global-left {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.video-control-global-left button {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}
.video-control-global-left button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
}

/* Featured products */
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
</style>
