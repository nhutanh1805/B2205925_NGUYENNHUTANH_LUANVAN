<template>
  <aside class="community-sidebar">
    <div class="sidebar-content">
      <!-- TITLE -->
      <h5 class="sidebar-title">
        <i class="bi bi-people-fill me-2"></i>Thông tin liên hệ
      </h5>

      <!-- VIDEO TRAILER -->
      <div class="sidebar-video mb-4">
        <video
          ref="sidebarVideo"
          :src="sidebarTrailer"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
          class="w-100 rounded-3 shadow-sm"
        ></video>
        <p class="small text-center text-light mt-2 mb-0">
          Trailer mới nhất 2025
        </p>
      </div>

      <!-- CONTACT INFO -->
      <div class="contact-info">
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

      <!-- ACTION BUTTONS -->
      <div class="sidebar-actions mt-4">
        <a href="tel:0823737258" class="action-btn call">
          <i class="bi bi-telephone-fill"></i> Gọi ngay
        </a>
        <a href="mailto:nhutanh180504@gmail.com" class="action-btn mail">
          <i class="bi bi-envelope-fill"></i> Email
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import sidebarTrailer from "@/assets/video/BannerMain.mp4";

const sidebarVideo = ref(null);

onMounted(() => {
  sidebarVideo.value?.play();
});
</script>

<style scoped>
.community-sidebar {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 280px;
  z-index: 1000;
  display: block;
}

@media (max-width: 1023px) {
  .community-sidebar {
    display: none;
  }
}

/* ================= CARD ================= */
.sidebar-content {
  position: relative;
  background: rgba(30, 30, 60, 0.95); /* làm sáng hơn để text nhìn rõ */
  border-radius: 24px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8);
  transition: 0.4s;
}

.sidebar-content::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 24px;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(168, 85, 247, 0.6),
    rgba(99, 102, 241, 0.6),
    transparent
  );
  z-index: -1;
  animation: glowMove 6s linear infinite;
}

@keyframes glowMove {
  from { filter: hue-rotate(0deg); }
  to { filter: hue-rotate(360deg); }
}

.sidebar-content:hover {
  transform: translateY(-8px);
}

/* ================= TITLE ================= */
.sidebar-title {
  color: #fde047;
  font-size: 1.45rem;
  font-weight: 900;
  margin-bottom: 20px;
  text-shadow: 0 2px 6px rgba(0,0,0,0.5);
}

/* ================= VIDEO ================= */
.sidebar-video video {
  height: 160px;
  object-fit: cover;
  border-radius: 14px;
  transition: 0.3s;
  z-index: 1;
  position: relative;
}

.sidebar-video p {
  color: #fff; /* chắc chắn đọc được */
}

/* ================= CONTACT ================= */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.08);
  transition: 0.3s;
}

.contact-item:hover {
  background: rgba(138,43,226,0.2);
  transform: translateX(-4px);
}

.contact-item i {
  font-size: 1.4rem;
  color: #fde047;
  transition: 0.3s;
}

.contact-item:hover i {
  color: #f97316;
}

.label {
  font-size: 0.8rem;
  color: #ccc;
}

.value {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 600;
}

/* ================= ACTION BUTTONS ================= */
.sidebar-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.action-btn {
  flex: 1;
  padding: 10px 12px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: 0.3s;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
}

.action-btn.call {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.action-btn.mail {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.action-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

/* ================= SCROLLBAR ================= */
.contact-info::-webkit-scrollbar {
  width: 6px;
}

.contact-info::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.7);
  border-radius: 3px;
}

.contact-info::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
}
</style>
