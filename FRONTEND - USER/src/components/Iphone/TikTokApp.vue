<template>
  <div class="tiktok-app">
    <!-- Nút quay về nhỏ -->
    <button class="back-button" @click="$emit('close')">←</button>

    <!-- Danh sách video full màn hình -->
    <div class="tiktok-videos">
      <div
        v-for="(video, index) in tiktokVideos"
        :key="index"
        class="video-wrapper"
        :ref="el => videoWrappers[index] = el"
      >
        <video
          :src="video"
          loop
          playsinline
          preload="auto"
          class="tiktok-video"
          ref="videoElements"
        ></video>

        <!-- Caption nằm ngay dưới video -->
        <div class="caption-overlay">
          <p class="caption-text">
            {{ captions[index] || 'Viết caption ở đây nhé! 🌟 #fyp #viral #tiktokvn' }}
          </p>
          <p class="music-name">
            ♫ {{ musicNames[index] || 'Original Sound - TikTok' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";

defineEmits(["close"]);

// Danh sách video
import video1 from '@/assets/video/Wall.mp4';
import video2 from '@/assets/video/Video1.mp4';
import video3 from '@/assets/video/Video2.mp4';
import video4 from '@/assets/video/Video3.mp4';
import video5 from '@/assets/video/BannerMain.mp4';
import video6 from '@/assets/video/Wall.mp4';

const tiktokVideos = [video1, video2, video3, video4, video5, video6];

// Caption và tên nhạc – bạn tự viết thoải mái
const captions = ref([
  'Wallpaper siêu đẹp cho iPhone! ✨ #wallpaper #iphone #aesthetic',
  'Wallpaper!',
  'Wallpaper!',
  'Onepiece luffy gear 5 tái xuất #nika #luffy',
  'Rock D. Xebec #rock #god',
  'Meme hay nhất tuần, share liền tay! 🤣 #meme #viral'
]);

const musicNames = ref([
  'Nhạc nền chill - Original sound',
  'Nhạc nền chill - Original sound',
  'Nhạc nền chill - Original sound',
  'Nhạc nền chill - Original sound',
  'Nhạc nền chill - Original sound',
  'Nhạc nền chill - Original sound'
]);

const videoElements = ref([]);
const videoWrappers = ref([]);
let observer = null;

onMounted(async () => {
  await nextTick();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = videoWrappers.value.indexOf(entry.target);
        const video = videoElements.value[index];

        if (!video) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          // TỰ ĐỘNG PHÁT khi video vào khung đủ 60%
          video.play().catch(() => {
            video.muted = true; // fallback nếu browser chặn autoplay có tiếng
            video.play();
          });
        } else {
          video.pause();
        }
      });
    },
    {
      root: null,
      threshold: [0, 0.6, 1.0],
    }
  );

  videoWrappers.value.forEach((wrapper) => {
    if (wrapper) observer.observe(wrapper);
  });
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.tiktok-app {
  position: absolute;
  inset: 0;
  background: #000;
  overflow: hidden;
  z-index: 50;
}

/* Nút back */
.back-button {
  position: absolute;
  top: 20px;
  left: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.4rem;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.tiktok-app:hover .back-button {
  opacity: 1;
  pointer-events: auto;
}

/* Scroll dọc */
.tiktok-videos {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tiktok-videos::-webkit-scrollbar {
  display: none;
}

/* Wrapper video */
.video-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

/* Video giữ nguyên tỷ lệ */
.tiktok-video {
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* Caption ngay dưới video */
.caption-overlay {
  width: 100%;
  padding: 16px;
  color: white;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  background: rgba(0,0,0,0.6);
  margin-top: 0;
}

.caption-text {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 4px 0;
}

.music-name {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
}
</style>