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
              <i class="bi bi-phone me-2"></i>Hot Deal 2025 - Phụ Kiện Điện Thoại
              <i class="bi bi-phone ms-2"></i>
            </span>

            <h1 class="display-1 fw-bold mb-4">
              TechStore - Phụ Kiện Điện Thoại Chính Hãng
            </h1>

            <p class="lead fs-2 mb-5">
              Ốp lưng • Cáp sạc • Tai nghe • Sạc nhanh • Pin dự phòng<br />
              Phụ kiện chất lượng cao, giá tốt cho mọi dòng điện thoại
            </p>

            <div class="d-flex flex-column flex-sm-row gap-4 justify-content-center">
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
              <i class="bi bi-lightning-charge text-success fs-2 mx-3"></i>
              <i class="bi bi-earbuds text-primary fs-2 mx-3"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Danh mục -->
    <section class="py-5 bg-white">
      <div class="container py-5">
        <h2 class="text-center fw-bold mb-5">Danh Mục Phụ Kiện</h2>
        <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-4 text-center">
          <div class="col" v-for="brand in brands" :key="brand.name">
            <div class="genre-icon mx-auto mb-2">
              <img :src="brand.logo" :alt="brand.name" class="img-fluid rounded-circle" />
            </div>
            {{ brand.name }}
          </div>
        </div>
      </div>
    </section>

    <!-- VIDEO BANNER CHÍNH -->
    <section class="py-5 bg-dark text-white">
      <div class="container text-center">
        <h2 class="fw-bold mb-4">Bộ sưu tập phụ kiện điện thoại mới nhất 2025</h2>
        <video
          ref="mainVideoRef"
          class="img-fluid rounded-4 shadow-lg"
          autoplay muted loop playsinline
          style="max-height: 600px; width: 100%; object-fit: cover"
        >
          <source :src="mainVideo" type="video/mp4" />
        </video>
        <p class="mt-3 text-muted">Khám phá các phụ kiện hot trend dành cho smartphone</p>
      </div>
    </section>

    <!-- VIDEO BANNER NHỎ -->
    <section class="py-5 bg-light">
      <div class="container">
        <h2 class="fw-bold mb-4 text-center">🎬 Video giới thiệu phụ kiện</h2>
        <div class="d-flex flex-wrap gap-3 justify-content-center">
          <div v-for="(video, index) in smallVideos" :key="index" class="small-video-card">
            <video :src="video" autoplay muted loop playsinline class="rounded shadow-sm"></video>
          </div>
        </div>
      </div>
    </section>

    <!-- HIỂN THỊ SẢN PHẨM -->
    <section class="py-6 featured-products">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold display-6 text-white mb-0">🔥 Phụ kiện bán chạy</h2>
          <router-link to="/products" class="btn btn-outline-light rounded-pill px-4 fw-bold">
            Xem tất cả →
          </router-link>
        </div>

        <div class="featured-scroll">
          <div v-for="product in hotProducts" :key="product._id" class="featured-card">
            <router-link :to="`/products/${product._id}`" class="card-inner">
              <span class="badge-hot">HOT</span>
              <img :src="smallCover(getProductImage(product))" alt="" class="product-img" />
              <div class="card-info">
                <h6 class="product-name">{{ product.name }}</h6>
                <p class="product-price">{{ product.price?.toLocaleString() }}₫</p>
                <p class="product-sold">🔥 Đã bán {{ product.sold || 0 }}</p>
                <button class="btn-buy">Xem chi tiết</button>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- FLASH SALE SECTION -->
    <section class="py-6 flash-sale-section">
      <div class="container">
        <div class="flash-sale-header mb-5">
          <div class="flash-sale-title">
            <span class="flash-badge">⚡ FLASH SALE</span>
            <h2 class="fw-bold mb-0">Khuyến Mãi Giới Hạn Thời Gian</h2>
          </div>
          <div class="countdown-timer">
            <div class="timer-item">
              <span class="timer-value">{{ countdownTimer.hours }}</span>
              <span class="timer-label">giờ</span>
            </div>
            <span class="timer-separator">:</span>
            <div class="timer-item">
              <span class="timer-value">{{ countdownTimer.minutes }}</span>
              <span class="timer-label">phút</span>
            </div>
            <span class="timer-separator">:</span>
            <div class="timer-item">
              <span class="timer-value">{{ countdownTimer.seconds }}</span>
              <span class="timer-label">giây</span>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div v-for="product in flashSaleProducts" :key="product._id" class="col-md-6 col-lg-3">
            <div class="flash-sale-card">
              <router-link :to="`/products/${product._id}`">
                <div class="flash-sale-image-wrapper">
                  <img :src="smallCover(getProductImage(product))" alt="" class="flash-sale-image" />
                  <div class="discount-badge">-{{ product.discount || 15 }}%</div>
                </div>
                <div class="flash-sale-info">
                  <h6 class="product-name">{{ product.name }}</h6>
                  <div class="price-wrapper">
                    <span class="original-price">{{ (product.price * 1.15)?.toLocaleString() }}₫</span>
                    <span class="sale-price">{{ product.price?.toLocaleString() }}₫</span>
                  </div>
                  <button class="btn-add-cart">Thêm vào giỏ</button>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ✅ REVIEWS THẬT — lấy từ API -->
    <section class="py-6 reviews-section">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-3">⭐ Đánh Giá Từ Khách Hàng</h2>
          <p class="text-muted fs-5">Nghe ý kiến từ những khách hàng hài lòng của chúng tôi</p>
        </div>

        <!-- Loading -->
        <div v-if="reviewsLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Đang tải đánh giá...</p>
        </div>

        <!-- Danh sách review thật -->
        <div v-else-if="latestReviews.length" class="reviews-container">
          <div v-for="review in latestReviews" :key="review._id" class="review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <!-- Avatar chữ cái đầu như ReviewSection -->
                <div class="reviewer-avatar-text">
                  {{ review.userInfo?.name?.charAt(0)?.toUpperCase() || "U" }}
                </div>
                <div>
                  <h6 class="reviewer-name">{{ review.userInfo?.name || "Người dùng" }}</h6>
                  <span class="reviewer-date">{{ formatDate(review.createdAt) }}</span>
                </div>
              </div>
              <div class="review-stars">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star"
                  :class="{ filled: star <= review.rating }"
                >★</span>
              </div>
            </div>

            <p v-if="review.title" class="review-title-text">{{ review.title }}</p>
            <p class="review-text">{{ review.comment }}</p>

            <!-- Tên sản phẩm nếu có -->
            <span v-if="review.productName" class="review-product">
              {{ review.productName }}
            </span>
          </div>
        </div>

        <!-- Không có review -->
        <div v-else class="text-center py-5 text-muted">
          <p>Chưa có đánh giá nào. Hãy mua hàng và để lại đánh giá! 🌟</p>
        </div>

        <div class="text-center mt-5">
          <router-link to="/products" class="btn btn-outline-primary rounded-pill px-5 py-3 fw-bold">
            Mua hàng & đánh giá →
          </router-link>
        </div>
      </div>
    </section>

    <!-- NEW ARRIVALS SECTION -->
    <section class="py-6 new-arrivals-section">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 class="fw-bold mb-2">📱 Sản Phẩm Mới Nhất</h2>
            <p class="text-muted">Khám phá các phụ kiện mới vừa về hàng</p>
          </div>
          <router-link to="/products" class="btn btn-primary rounded-pill px-4 fw-bold">
            Xem tất cả →
          </router-link>
        </div>

        <div class="new-arrivals-grid">
          <div v-for="product in newArrivals" :key="product._id" class="new-arrival-item">
            <router-link :to="`/products/${product._id}`" class="arrival-card">
              <div class="arrival-image-wrapper">
                <img :src="smallCover(getProductImage(product))" alt="" class="arrival-image" />
                <span class="new-badge">NEW</span>
              </div>
              <div class="arrival-info">
                <h6 class="product-name">{{ product.name }}</h6>
                <div class="product-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-count">({{ product.reviews || 0 }})</span>
                </div>
                <p class="product-price">{{ product.price?.toLocaleString() }}₫</p>
                <div class="button-group">
                  <button class="btn-like">❤️</button>
                  <button class="btn-cart">🛒</button>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import productService from "@/services/product.service";
import ReviewService from "@/services/review.service";
import mainVideo from "@/assets/video/Banner Chính.mp4";
import heroImage from "@/assets/img/BannerPhone.jpg";

import TaiNghe from "@/assets/img/Tai nghe.jpg";
import CuSac from "@/assets/img/Củ sạc.jpg";
import CapSac from "@/assets/img/Cáp sạc.jpg";
import KinhCuongLuc from "@/assets/img/Kính cường lực.jpg";
import PinDuPhong from "@/assets/img/Pin dự phòng.jpg";
import SacKhongDay from "@/assets/img/Sạc không dây.jpg";

/* Video phụ */
const smallVideos = Array(12).fill(mainVideo);

/* Video refs */
const mainVideoRef = ref(null);
const allPlaying = ref(true);

const toggleAllVideos = () => {
  const videos = [];
  if (mainVideoRef.value) videos.push(mainVideoRef.value);
  document.querySelectorAll(".small-video-card video").forEach((v) => videos.push(v));
  if (allPlaying.value) videos.forEach((v) => v.pause());
  else videos.forEach((v) => v.play());
  allPlaying.value = !allPlaying.value;
};

/* Brands */
const brands = [
  { name: "Tai Nghe", logo: TaiNghe },
  { name: "Củ sạc", logo: CuSac },
  { name: "Cáp sạc", logo: CapSac },
  { name: "Kính cường lực", logo: KinhCuongLuc },
  { name: "Pin dự phòng", logo: PinDuPhong },
  { name: "Sạc không dây", logo: SacKhongDay },
];

/* Sản phẩm */
const hotProducts = ref([]);
const flashSaleProducts = ref([]);
const newArrivals = ref([]);

/* ✅ Reviews thật */
const latestReviews = ref([]);
const reviewsLoading = ref(false);

/* Countdown */
const countdownTimer = ref({ hours: 2, minutes: 30, seconds: 45 });
let countdownInterval = null;

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    let { hours, minutes, seconds } = countdownTimer.value;
    seconds--;
    if (seconds < 0) { seconds = 59; minutes--; }
    if (minutes < 0) { minutes = 59; hours--; }
    if (hours < 0) { hours = 2; minutes = 30; seconds = 45; }
    countdownTimer.value = { hours, minutes, seconds };
  }, 1000);
};

/* ✅ Load reviews thật từ nhiều sản phẩm bán chạy */
async function loadLatestReviews(products = []) {
  reviewsLoading.value = true;
  try {
    const collected = [];

    // Lấy review từ tối đa 6 sản phẩm đầu tiên
    const targets = products.slice(0, 6);
    await Promise.all(
      targets.map(async (p) => {
        try {
          const res = await ReviewService.getByProduct(p._id, { page: 1, limit: 3 });
          const reviews = res.reviews || [];
          // Gắn tên sản phẩm vào mỗi review để hiển thị
          reviews.forEach((r) => {
            r.productName = p.name;
          });
          collected.push(...reviews);
        } catch (_) {}
      })
    );

    // Chỉ lấy review 5 sao + sắp xếp mới nhất, giới hạn 8 cái
    latestReviews.value = collected
      .filter((r) => r.rating >= 4)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  } catch (_) {
  } finally {
    reviewsLoading.value = false;
  }
}

/* Format ngày */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* Image helpers */
const getProductImage = (product) => {
  if (!product) return null;
  if (typeof product.image === "string") return product.image;
  if (typeof product.thumbnail === "string") return product.thumbnail;
  if (Array.isArray(product.images))
    return product.images[0]?.secure_url || product.images[0]?.url || product.images[0];
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
    const res = await productService.getAll({ limit: 12, sortBy: "sold", sortOrder: "desc" });
    const products = (res.products || res).slice(0, 12);

    hotProducts.value = products.slice(0, 8);
    flashSaleProducts.value = products.slice(0, 4);
    newArrivals.value = products.slice(4, 12);

    // ✅ Load reviews thật sau khi có danh sách sản phẩm
    await loadLatestReviews(products);
  } catch (err) {
    console.log(err);
  }

  startCountdown();
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
/* VIDEO CONTROL LEFT */
.video-control-global-left {
  position: fixed;
  bottom: 30px; left: 30px;
  z-index: 9999;
  display: flex; flex-direction: column; gap: 8px;
}
.video-control-global-left button {
  box-shadow: 0 8px 20px rgba(0,0,0,0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}
.video-control-global-left button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 28px rgba(0,0,0,0.6);
}

/* Featured products */
.featured-products { background: linear-gradient(135deg, #1e1b4b, #020617); }
.featured-scroll { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; }
.featured-card { flex: 0 0 200px; scroll-snap-align: start; }
.card-inner {
  position: relative; display: block;
  background: #0f172a; border-radius: 20px; overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  transition: 0.35s; text-decoration: none; color: white;
}
.card-inner:hover { transform: translateY(-8px) scale(1.04); box-shadow: 0 30px 80px rgba(99,102,241,0.6); }
.product-img { width: 100%; height: 260px; object-fit: cover; }
.card-info { padding: 14px; }
.product-name { font-weight: 700; margin-bottom: 6px; }
.product-price { color: #fde047; font-weight: bold; }
.product-sold { font-size: 0.8rem; opacity: 0.8; }
.btn-buy {
  margin-top: 10px; width: 100%; padding: 8px; border-radius: 999px; border: none;
  font-weight: bold; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
  opacity: 0; transform: translateY(10px); transition: 0.3s;
}
.card-inner:hover .btn-buy { opacity: 1; transform: translateY(0); }
.badge-hot {
  position: absolute; top: 12px; left: 12px;
  padding: 6px 12px; font-size: 0.75rem; font-weight: bold; border-radius: 999px;
  background: linear-gradient(135deg, #ef4444, #f97316);
}
.small-video-card video {
  width: 180px; height: 100px; object-fit: cover;
  border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.small-video-card video:hover { transform: scale(1.05); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }

/* FLASH SALE */
.flash-sale-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%);
  position: relative; overflow: hidden;
}
.flash-sale-section::before {
  content: ""; position: absolute; top: -50%; right: -10%;
  width: 500px; height: 500px; background: rgba(255,193,7,0.1); border-radius: 50%;
}
.flash-sale-header {
  display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 20px; position: relative; z-index: 1;
}
.flash-sale-title { display: flex; align-items: center; gap: 15px; }
.flash-badge {
  display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316);
  color: white; padding: 8px 16px; border-radius: 50px;
  font-weight: 700; font-size: 0.9rem; animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.countdown-timer {
  display: flex; align-items: center; gap: 8px;
  background: white; padding: 15px 25px; border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.timer-item { display: flex; flex-direction: column; align-items: center; min-width: 50px; }
.timer-value { font-size: 1.5rem; font-weight: 700; color: #ef4444; }
.timer-label { font-size: 0.7rem; color: #666; margin-top: 2px; }
.timer-separator { font-size: 1.5rem; color: #ef4444; font-weight: 700; margin: 0 5px; }
.flash-sale-card a { text-decoration: none; color: inherit; }
.flash-sale-image-wrapper {
  position: relative; overflow: hidden; border-radius: 12px;
  background: white; margin-bottom: 12px;
}
.flash-sale-image { width: 100%; height: 220px; object-fit: cover; transition: transform 0.3s; }
.flash-sale-card:hover .flash-sale-image { transform: scale(1.1); }
.discount-badge {
  position: absolute; top: 10px; right: 10px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.85rem;
}
.flash-sale-info { padding: 12px; }
.price-wrapper { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
.original-price { text-decoration: line-through; color: #999; font-size: 0.9rem; }
.sale-price { color: #ef4444; font-weight: 700; font-size: 1.1rem; }
.btn-add-cart {
  width: 100%; padding: 10px; border: none;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white; border-radius: 8px; font-weight: 600; cursor: pointer;
  transition: all 0.3s; margin-top: 8px;
}
.btn-add-cart:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(245,158,11,0.4); }

/* ✅ REVIEWS THẬT */
.reviews-section { background: white; position: relative; }
.reviews-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px; margin-bottom: 30px;
}
.review-card {
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 16px; padding: 24px; transition: all 0.3s;
}
.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1); border-color: #d1d5db;
}
.review-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 16px;
}
.reviewer-info { display: flex; gap: 12px; align-items: center; }

/* Avatar chữ cái — đồng bộ với ReviewSection */
.reviewer-avatar-text {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white; font-weight: 700; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.reviewer-name { font-weight: 600; margin-bottom: 4px; color: #111827; }
.reviewer-date { font-size: 0.85rem; color: #9ca3af; }
.review-stars { display: flex; gap: 4px; }
.star { font-size: 1.2rem; color: #d1d5db; }
.star.filled { color: #fbbf24; }
.review-title-text { font-weight: 600; font-size: 0.95rem; margin-bottom: 6px; color: #111827; }
.review-text { color: #4b5563; line-height: 1.6; margin-bottom: 12px; font-size: 0.95rem; }
.review-product {
  display: inline-block; background: #dbeafe; color: #1e40af;
  padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500;
}

/* NEW ARRIVALS */
.new-arrivals-section { background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%); }
.new-arrivals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.arrival-card { display: block; text-decoration: none; color: inherit; height: 100%; transition: all 0.3s; }
.arrival-image-wrapper {
  position: relative; overflow: hidden; border-radius: 12px;
  background: white; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.arrival-image { width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s; }
.new-arrival-item:hover .arrival-image { transform: scale(1.15) rotate(2deg); }
.new-badge {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white; padding: 6px 12px; border-radius: 50px;
  font-weight: 700; font-size: 0.75rem; animation: fadeInOut 2s infinite;
}
@keyframes fadeInOut { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.arrival-info { padding: 12px; }
.product-rating { display: flex; align-items: center; gap: 6px; margin: 8px 0; font-size: 0.9rem; }
.stars { color: #fbbf24; font-weight: 600; }
.rating-count { color: #9ca3af; font-size: 0.85rem; }
.button-group {
  display: flex; gap: 8px; margin-top: 12px;
  opacity: 0; transform: translateY(10px); transition: all 0.3s;
}
.new-arrival-item:hover .button-group { opacity: 1; transform: translateY(0); }
.btn-like, .btn-cart {
  flex: 1; padding: 8px; border: 1px solid #e5e7eb;
  background: white; border-radius: 8px; cursor: pointer; font-size: 1.2rem; transition: all 0.3s;
}
.btn-like:hover { background: #fee2e2; border-color: #ef4444; }
.btn-cart:hover { background: #dbeafe; border-color: #3b82f6; }

/* Responsive */
@media (max-width: 768px) {
  .flash-sale-header { flex-direction: column; }
  .countdown-timer { padding: 12px 20px; }
  .timer-value { font-size: 1.2rem; }
  .reviews-container { grid-template-columns: 1fr; }
  .new-arrivals-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
</style>