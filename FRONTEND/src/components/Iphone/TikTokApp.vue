<template>
  <div class="tiktok-app" ref="appRef">
    <!-- Back button -->
    <button class="back-btn" @click="$emit('close')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </button>

    <!-- Video feed -->
    <div class="tiktok-feed" ref="feedRef">
      <div
        v-for="(video, index) in tiktokVideos"
        :key="index"
        class="video-slide"
        :ref="el => videoWrappers[index] = el"
        @dblclick="triggerLike(index, $event)"
        @click.self="togglePause(index)"
      >
        <!-- Video -->
        <video
          :src="video"
          loop
          playsinline
          preload="auto"
          class="video-el"
          :ref="el => videoElements[index] = el"
        />

        <!-- Pause icon -->
        <Transition name="pause-icon">
          <div v-if="pausedIndex === index" class="pause-overlay">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
          </div>
        </Transition>

        <!-- Double-tap heart burst -->
        <TransitionGroup name="heart-burst">
          <div
            v-for="h in hearts[index]"
            :key="h.id"
            class="heart-burst"
            :style="{ left: h.x + 'px', top: h.y + 'px' }"
          >❤️</div>
        </TransitionGroup>

        <!-- Progress bar -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progresses[index] + '%' }"></div>
        </div>

        <!-- Bottom info -->
        <div class="bottom-info">
          <div class="user-row">
            <div class="avatar">{{ avatars[index] }}</div>
            <span class="username">@{{ usernames[index] }}</span>
            <button class="follow-btn" :class="{ following: followStates[index] }" @click.stop="toggleFollow(index)">
              {{ followStates[index] ? 'Đang theo dõi' : '+ Theo dõi' }}
            </button>
          </div>

          <p class="caption">{{ captions[index] }}</p>

          <!-- Music ticker -->
          <div class="music-row">
            <span class="music-note">♫</span>
            <div class="music-ticker-wrap">
              <span class="music-ticker">{{ musicNames[index] }}</span>
            </div>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="sidebar">
          <!-- Avatar + follow dot -->
          <div class="sidebar-avatar-wrap">
            <div class="sidebar-avatar">{{ avatars[index] }}</div>
            <button class="follow-dot" @click.stop="toggleFollow(index)">
              {{ followStates[index] ? '✓' : '+' }}
            </button>
          </div>

          <!-- Like -->
          <button class="action-btn" @click.stop="toggleLike(index)">
            <div class="action-icon" :class="{ liked: likeStates[index] }">
              <svg width="28" height="28" viewBox="0 0 24 24" :fill="likeStates[index] ? '#ff2b54' : 'none'" stroke="currentColor" stroke-width="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <span class="action-count">{{ formatCount(likeCounts[index]) }}</span>
          </button>

          <!-- Comment -->
          <button class="action-btn" @click.stop>
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span class="action-count">{{ formatCount(commentCounts[index]) }}</span>
          </button>

          <!-- Share -->
          <button class="action-btn" @click.stop>
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </div>
            <span class="action-count">{{ formatCount(shareCounts[index]) }}</span>
          </button>

          <!-- Music disc -->
          <div class="music-disc" :class="{ spinning: currentIndex === index && !pausedIndex }">
            <span>🎵</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

import video1 from '@/assets/video/Wall.mp4'
import video2 from '@/assets/video/Video1.mp4'
import video3 from '@/assets/video/Video2.mp4'
import video4 from '@/assets/video/Video3.mp4'
import video5 from '@/assets/video/BannerMain.mp4'
import video6 from '@/assets/video/Wall.mp4'

defineEmits(['close'])

const tiktokVideos = [video1, video2, video3, video4, video5, video6]

const captions = ref([
  'Wallpaper siêu đẹp cho iPhone! ✨ #wallpaper #iphone #aesthetic',
  'Video chill nhất hôm nay 🌊 #chill #vibes',
  'POV: bạn đang xem TikTok lúc 2h sáng 😴 #relatable',
  'Onepiece luffy gear 5 tái xuất 🔥 #nika #luffy #onepiece',
  'Rock D. Xebec đã trở lại 💀 #rock #god #onepiece',
  'Meme hay nhất tuần, share liền tay! 🤣 #meme #viral #fyp'
])

const musicNames = ref([
  'Nhạc nền chill - Original sound • Aesthetic Vibes',
  'Lofi beats to relax - Lo-Fi Girl',
  'Night Owl - Chill Session',
  'We Are! - Kitadani Hiroshi',
  'Rocks - Hound Dog',
  'Meme Sound - Trending Audio'
])

const usernames = ref(['aesthetic.wall', 'chill.vibes', 'nightowl.vn', 'anime.lover', 'manga.fan', 'meme.daily'])
const avatars   = ref(['🌸','🌊','🦉','⚡','💀','😂'])

const followStates  = ref(Array(6).fill(false))
const likeStates    = ref(Array(6).fill(false))
const likeCounts    = ref([12400, 8200, 34100, 89300, 55700, 102000])
const commentCounts = ref([430, 210, 1200, 4500, 3100, 8700])
const shareCounts   = ref([1100, 560, 3200, 12000, 7800, 25000])
const progresses    = ref(Array(6).fill(0))
const hearts        = ref(Array(6).fill(null).map(() => []))
const pausedIndex   = ref(null)
const currentIndex  = ref(0)

const videoElements = ref([])
const videoWrappers = ref([])
let observer = null
let heartId = 0
let progressTimers = []

const formatCount = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)

const toggleLike = (i) => {
  likeStates.value[i] = !likeStates.value[i]
  likeCounts.value[i] += likeStates.value[i] ? 1 : -1
}

const toggleFollow = (i) => { followStates.value[i] = !followStates.value[i] }

const togglePause = (i) => {
  const v = videoElements.value[i]
  if (!v) return
  if (v.paused) { v.play(); pausedIndex.value = null }
  else          { v.pause(); pausedIndex.value = i }
}

const triggerLike = (i, e) => {
  if (!likeStates.value[i]) toggleLike(i)
  const rect = e.currentTarget.getBoundingClientRect()
  const id = heartId++
  hearts.value[i].push({ id, x: e.clientX - rect.left - 20, y: e.clientY - rect.top - 20 })
  setTimeout(() => {
    hearts.value[i] = hearts.value[i].filter(h => h.id !== id)
  }, 900)
}

const startProgress = (i) => {
  clearInterval(progressTimers[i])
  progresses.value[i] = 0
  progressTimers[i] = setInterval(() => {
    const v = videoElements.value[i]
    if (v && v.duration) {
      progresses.value[i] = (v.currentTime / v.duration) * 100
    }
  }, 200)
}

onMounted(async () => {
  await nextTick()

  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const index = videoWrappers.value.indexOf(entry.target)
      const video = videoElements.value[index]
      if (!video) return

      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        currentIndex.value = index
        pausedIndex.value = null
        video.play().catch(() => { video.muted = true; video.play() })
        startProgress(index)
      } else {
        video.pause()
        clearInterval(progressTimers[index])
      }
    })
  }, { threshold: [0, 0.6, 1.0] })

  videoWrappers.value.forEach(w => { if (w) observer.observe(w) })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  progressTimers.forEach(t => clearInterval(t))
})
</script>

<style scoped>
/* ── Base ── */
.tiktok-app {
  position: absolute;
  inset: 0;
  background: #000;
  overflow: hidden;
  z-index: 50;
  font-family: -apple-system, 'SF Pro Display', sans-serif;
}

.back-btn {
  position: absolute;
  top: 14px;
  left: 12px;
  z-index: 200;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(8px);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ── Feed ── */
.tiktok-feed {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
}
.tiktok-feed::-webkit-scrollbar { display: none; }

/* ── Slide ── */
.video-slide {
  position: relative;
  height: 100%;
  width: 100%;
  scroll-snap-align: start;
  overflow: hidden;
  background: #000;
}

.video-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Pause overlay ── */
.pause-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(0,0,0,0.2);
}

.pause-icon-enter-active, .pause-icon-leave-active { transition: opacity 0.2s, transform 0.2s; }
.pause-icon-enter-from, .pause-icon-leave-to { opacity: 0; transform: scale(1.3); }

/* ── Heart burst ── */
.heart-burst {
  position: absolute;
  font-size: 2.4rem;
  pointer-events: none;
  z-index: 20;
  animation: heartFloat 0.9s ease-out forwards;
}

@keyframes heartFloat {
  0%   { opacity: 1; transform: scale(0.4) translateY(0); }
  60%  { opacity: 1; transform: scale(1.3) translateY(-60px); }
  100% { opacity: 0; transform: scale(1) translateY(-110px); }
}

.heart-burst-enter-active { transition: none; }
.heart-burst-leave-active  { transition: none; }

/* ── Progress bar ── */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255,255,255,0.2);
  z-index: 30;
}

.progress-fill {
  height: 100%;
  background: #fff;
  transition: width 0.2s linear;
}

/* ── Bottom info ── */
.bottom-info {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 70px;
  padding: 0 14px 18px;
  z-index: 15;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.username {
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  flex: 1;
}

.follow-btn {
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.follow-btn.following {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.4);
  color: rgba(255,255,255,0.7);
}

.caption {
  color: #fff;
  font-size: 0.78rem;
  line-height: 1.4;
  margin: 0 0 8px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Music ticker ── */
.music-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.music-note {
  color: #fff;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.music-ticker-wrap {
  overflow: hidden;
  flex: 1;
}

.music-ticker {
  display: inline-block;
  color: rgba(255,255,255,0.85);
  font-size: 0.75rem;
  white-space: nowrap;
  animation: tickerScroll 8s linear infinite;
}

@keyframes tickerScroll {
  0%   { transform: translateX(0); }
  40%  { transform: translateX(-60%); }
  50%  { transform: translateX(-60%); }
  90%  { transform: translateX(0); }
  100% { transform: translateX(0); }
}

/* ── Right sidebar ── */
.sidebar {
  position: absolute;
  right: 8px;
  bottom: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  z-index: 20;
}

.sidebar-avatar-wrap {
  position: relative;
  margin-bottom: 4px;
}

.sidebar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.follow-dot {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff2b54;
  border: none;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.follow-dot:hover { background: #e01f47; }

.action-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0;
}

.action-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.5));
}

.action-icon:active { transform: scale(0.85); }
.action-icon.liked { color: #ff2b54; animation: likePop 0.3s ease; }

@keyframes likePop {
  0%  { transform: scale(1); }
  50% { transform: scale(1.35); }
  100%{ transform: scale(1); }
}

.action-count {
  font-size: 0.65rem;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
}

/* ── Music disc ── */
.music-disc {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #333, #111);
  border: 3px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.music-disc.spinning {
  animation: spinDisc 4s linear infinite;
}

@keyframes spinDisc {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>