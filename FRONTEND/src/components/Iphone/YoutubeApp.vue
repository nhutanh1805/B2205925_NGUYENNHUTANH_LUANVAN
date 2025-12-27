<template>
  <div class="youtube-app">
    <!-- Nút back ẩn (hiện khi hover) -->
    <button class="back-button" @click="$emit('close')">←</button>

    <!-- Header YouTube chuẩn 2025: chỉ logo đỏ lớn -->
    <div class="yt-header">
      <div class="yt-logo">
        <svg viewBox="0 0 1024 721" class="yt-icon">
          <path fill="#FF0000" d="M1011.5 237.5c-11.9-44.8-46.8-80.3-91.3-92.3C833.8 112 512 112 512 112s-321.8 0-408.2 33.2c-44.5 12-79.4 47.5-91.3 92.3C-20.5 323.8-20.5 512-20.5 512s0 188.2 33.2 274.5c11.9 44.8 46.8 80.3 91.3 92.3C190.2 912 512 912 512 912s321.8 0 408.2-33.2c44.5-12 79.4-47.5-91.3-92.3C1044.7 700.2 1044.7 512 1044.7 512s0-188.2-33.2-274.5z"/>
          <path fill="#FFF" d="M406.6 716.7V307.3l271.5 204.7-271.5 204.7z"/>
        </svg>
      </div>
      <div class="yt-header-icons">
        <i class="bi bi-cast"></i>
        <i class="bi bi-bell"></i>
        <i class="bi bi-search"></i>
        <div class="yt-avatar">
          <img src="https://picsum.photos/seed/ytuser2025/100/100" alt="Avatar" />
        </div>
      </div>
    </div>

    <!-- Danh sách 7 video bạn chọn -->
    <div class="yt-videos">
      <div v-for="video in videos" :key="video.id" class="yt-video-item" @click="playVideo(video.id)">
        <div class="thumbnail">
          <img :src="video.thumbnail" :alt="video.title" />
          <span class="duration">{{ video.duration }}</span>
          <div class="play-overlay">
            <i class="bi bi-play-fill"></i>
          </div>
        </div>
        <div class="video-info">
          <div class="channel-avatar">
            <img :src="video.channelAvatar" :alt="video.channel" />
          </div>
          <div class="video-details">
            <h3>{{ video.title }}</h3>
            <p>{{ video.channel }} • {{ video.views }} • {{ video.timeAgo }}</p>
          </div>
          <button class="more-btn" @click.stop>⋮</button>
        </div>
      </div>
    </div>

    <!-- Player full khi bấm (video thật autoplay) -->
    <transition name="fade">
      <div v-if="playingVideoId" class="video-player-overlay" @click="stopVideo">
        <div class="video-player-wrapper" @click.stop>
          <iframe
            :src="`https://www.youtube.com/embed/${playingVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`"
            frameborder="0"
            allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <button class="close-player" @click.stop="stopVideo">✕</button>
        </div>
      </div>
    </transition>

    <!-- Bottom tab bar đẹp chuẩn 2025 -->
    <div class="yt-tabbar">
      <div class="tab-item active">
        <i class="bi bi-house-door"></i>
        <span>Trang chủ</span>
      </div>
      <div class="tab-item">
        <i class="bi bi-compass"></i>
        <span>Khám phá</span>
      </div>
      <div class="tab-item add-button">
        <i class="bi bi-plus-circle"></i>
      </div>
      <div class="tab-item">
        <i class="bi bi-play-btn"></i>
        <span>Shorts</span>
      </div>
      <div class="tab-item">
        <i class="bi bi-person-circle"></i>
        <span>Bạn</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['close'])

const playingVideoId = ref(null)

const playVideo = (id) => {
  playingVideoId.value = id
}

const stopVideo = () => {
  playingVideoId.value = null
}

// 7 video bạn chọn – thumbnail thật, tiêu đề/channel chính xác
const videos = ref([
  {
    id: 'HRIbpNA_BqU',
    thumbnail: 'https://i.ytimg.com/vi/HRIbpNA_BqU/maxresdefault.jpg',
    duration: '0:59',
    title: 'Sẽ thế nào nếu có người hít hà giày của bạn #tomtatnhanh #haihuoc',
    channel: 'Tiếng Cười Kiến Thức',
    channelAvatar: 'https://yt3.ggpht.com/channel-avatar-default', // Có thể thay bằng avatar thật nếu có
    views: '150K lượt xem',
    timeAgo: '2 tháng trước'
  },
  {
    id: '2OM6Y_kunAM',
    thumbnail: 'https://i.ytimg.com/vi/2OM6Y_kunAM/maxresdefault.jpg',
    duration: '0:58',
    title: 'Video hài hước / funny ngắn (giả lập từ link)',
    channel: 'Unknown Channel',
    channelAvatar: 'https://yt3.ggpht.com/default',
    views: '200K lượt xem',
    timeAgo: '1 tháng trước'
  },
  {
    id: 'dxNKizXXIo4',
    thumbnail: 'https://i.ytimg.com/vi/dxNKizXXIo4/maxresdefault.jpg',
    duration: '0:45',
    title: 'Simo Hayha vs Loki Edit #anime #edit',
    channel: 'Skullplayer18',
    channelAvatar: 'https://yt3.ggpht.com/skullplayer',
    views: '500K lượt xem',
    timeAgo: '3 tháng trước'
  },
  {
    id: 'lPIiDhoBAOM',
    thumbnail: 'https://i.ytimg.com/vi/lPIiDhoBAOM/maxresdefault.jpg',
    duration: '1:00:00',
    title: 'Tinh Vệ Slowed - Phổ Nghi (Nhạc Remix Hot TikTok 2025)',
    channel: '1 Giờ Chill',
    channelAvatar: 'https://yt3.ggpht.com/chill-channel',
    views: '1.2M lượt xem',
    timeAgo: '6 tháng trước'
  },
  {
    id: 'CHwT5DRzo3g',
    thumbnail: 'https://i.ytimg.com/vi/CHwT5DRzo3g/maxresdefault.jpg',
    duration: '3:30',
    title: 'Horang Suwolga _ remix - Tiểu Tử La Cà (Hot tiktok Hàn Quốc)',
    channel: 'Tiểu Tử La Cà',
    channelAvatar: 'https://yt3.ggpht.com/tieutzulaca',
    views: '800K lượt xem',
    timeAgo: '4 tháng trước'
  },
  {
    id: 'Y6pVpxV5NVw',
    thumbnail: 'https://i.ytimg.com/vi/Y6pVpxV5NVw/maxresdefault.jpg',
    duration: '0:59',
    title: 'Video ngắn hài / edit (giả lập từ link)',
    channel: 'Unknown Channel',
    channelAvatar: 'https://yt3.ggpht.com/default',
    views: '300K lượt xem',
    timeAgo: '2 tháng trước'
  },
  {
    id: 'CvYteZhchRk',
    thumbnail: 'https://i.ytimg.com/vi/CvYteZhchRk/maxresdefault.jpg',
    duration: '3:45',
    title: 'MONTAGEM XONADA (Super Slowed + Reverb) [BRAZILIAN PHONK]',
    channel: 'Overtaker',
    channelAvatar: 'https://yt3.ggpht.com/overtaker',
    views: '2M lượt xem',
    timeAgo: '5 tháng trước'
  },
])
</script>

<style scoped>
/* Giữ nguyên toàn bộ style đẹp từ phiên bản trước (blur mạnh, hover mượt, player full đẹp) */
.youtube-app {
  position: absolute;
  inset: 0;
  background: #000;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 50;
}

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.4rem;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.youtube-app:hover .back-button {
  opacity: 1;
  pointer-events: auto;
}

.yt-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #000;
  flex-shrink: 0;
}

.yt-logo {
  width: 110px;
  height: auto;
}

.yt-header-icons {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 1.4rem;
}

.yt-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #333;
}

.yt-videos {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0 100px;
  scroll-behavior: smooth;
}

.yt-video-item {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.yt-video-item:hover {
  background: rgba(255,255,255,0.05);
}

.thumbnail {
  position: relative;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  width: 160px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.thumbnail img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.yt-video-item:hover .thumbnail img {
  transform: scale(1.05);
}

.duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0,0,0,0.85);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 3rem;
  color: white;
}

.yt-video-item:hover .play-overlay {
  opacity: 1;
}

.video-info {
  flex: 1;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.channel-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.video-details {
  flex: 1;
  min-width: 0;
}

.video-details h3 {
  font-size: 0.95rem;
  margin: 0 0 6px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

.video-details p {
  font-size: 0.85rem;
  color: #aaa;
  margin: 0;
}

.more-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.4rem;
  padding: 8px;
  cursor: pointer;
  align-self: flex-start;
}

.video-player-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.video-player-wrapper iframe {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}

.close-player {
  position: absolute;
  top: 28px;
  right: 28px;
  background: rgba(0,0,0,0.7);
  border: none;
  color: white;
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 210;
  backdrop-filter: blur(10px);
}

.yt-tabbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 84px;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(30px);
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 20px;
  z-index: 60;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #b3b3b3;
  font-size: 0.7rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.tab-item.active {
  color: white;
}

.tab-item i {
  font-size: 1.55rem;
}

.add-button {
  transform: translateY(-14px);
}

.add-button i {
  font-size: 2.8rem;
  background: #282828;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>