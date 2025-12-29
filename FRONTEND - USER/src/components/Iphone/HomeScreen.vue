<template>
  <div class="home-screen">

    <!-- APP GRID -->
    <div class="app-grid" :class="{ jiggle: jiggleMode }">
      <div
        v-for="app in apps"
        :key="app.name"
        class="app-icon"
        @click="openApp(app)"
        @mousedown="startHold"
        @mouseup="cancelHold"
        @mouseleave="cancelHold"
      >
        <div class="icon-bg" :style="{ background: app.bg }">
          <!-- Icon thường dùng Bootstrap Icons -->
          <i v-if="app.name !== 'TikTok'" :class="app.icon"></i>

          <!-- Logo TikTok chính thức (SVG inline) -->
          <svg v-else viewBox="0 0 48 48" class="tiktok-logo">
            <defs>
              <linearGradient id="tiktokGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff0050"/>
                <stop offset="50%" stop-color="#00f2ea"/>
                <stop offset="100%" stop-color="#ff0050"/>
              </linearGradient>
            </defs>
            <path d="M24.338 11.1c-4.658 0-8.416 3.758-8.416 8.416 0 1.753.536 3.374 1.45 4.723-3.204 1.292-5.572 4.258-5.572 7.828 0 4.418 3.582 8 8 8h1.2v-8h-1.2c-2.172 0-4-1.828-4-4 0-1.764 1.158-3.268 2.786-3.846.394-1.43 1.754-2.42 3.34-2.42.276 0 .542.034.8.1.552-3.07 3.17-5.4 6.412-5.4 3.584 0 6.492 2.908 6.492 6.492 0 .828-.156 1.62-.438 2.354 1.43-.276 2.752-.828 3.938-1.614 2.172-1.448 3.584-3.966 3.584-6.762 0-4.418-3.582-8-8-8-2.31 0-4.418 1.966-5.878 5.082-1.46-3.116-3.568-5.082-5.878-5.082z" fill="url(#tiktokGradient)"/>
            <path d="M24 28c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#000"/>
            <path d="M32 20c-.552 0-1 .448-1 1v14c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8v-4c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12V21c0-.552-.448-1-1-1z" fill="white"/>
          </svg>

          <span v-if="app.badge" class="badge">{{ app.badge }}</span>
        </div>
        <span>{{ app.name }}</span>
      </div>
    </div>

    <!-- DOCK -->
    <div class="dock">
      <div
        v-for="app in dockApps"
        :key="app.name"
        class="dock-icon"
        :style="{ background: app.bg }"
        @click="openApp(app)"
      >
        <i :class="app.icon"></i>
      </div>
    </div>

    <!-- APP SCREEN -->
    <transition name="app">
      <div v-if="activeApp" class="app-screen">
        <button class="back-button" @click="closeApp">←</button>

        <div v-if="activeApp.name !== 'TikTok'" class="app-header">
          <button @click="closeApp">←</button>
          <span>{{ activeApp.name }}</span>
        </div>

        <div class="app-content no-scrollbar">
          <template v-if="activeApp.name === 'Music'">
            <button @click="toggleMusic">
              {{ isPlaying ? '⏸ Pause' : '▶️ Play' }}
            </button>
            <div class="dummy-content">
              <p>Scroll down to see more content...</p>
              <p v-for="i in 20" :key="i">Music item {{ i }}</p>
            </div>
          </template>

          <template v-else-if="activeApp.name === 'TikTok'">
            <TikTokApp @close="closeApp" />
          </template>

          <template v-else-if="activeApp.name === 'Pinterest'">
            <PinterestApp @close="closeApp" />
          </template>

          <template v-else-if="activeApp.name === 'Safari'">
            <iframe src="https://vuejs.org" frameborder="0"></iframe>
          </template>

          <template v-else-if="activeApp.name === 'Phone'">
            <div class="phone-pad no-scrollbar">
              <p v-for="i in 30" :key="i">Number {{ i }}</p>
            </div>
          </template>

          <template v-else-if="activeApp.name === 'Settings'">
            <div class="no-scrollbar">
              <label>
                <input type="checkbox" v-model="darkMode" /> Dark Mode
              </label>
              <p v-for="i in 20" :key="i">Setting option {{ i }}</p>
            </div>
          </template>

<template v-else-if="activeApp.name === 'YouTube'">
  <YoutubeApp @close="closeApp" />
</template>

          <template v-else-if="activeApp.name === 'Lock'">
            <div class="lock-app-content">
              <i class="bi bi-lock-fill fs-1 text-white mb-4"></i>
              <p>Đang khóa màn hình...</p>
            </div>
          </template>

          <template v-else>
            <div class="no-scrollbar">
              <p>{{ activeApp.name }} App Content</p>
              <p v-for="i in 20" :key="i">{{ activeApp.name }} content {{ i }}</p>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TikTokApp from './TikTokApp.vue'
import PinterestApp from './PinterestApp.vue'  // <-- Thêm dòng này
import YoutubeApp from './YoutubeApp.vue'

const emit = defineEmits(['lock'])

const activeApp = ref(null)
const jiggleMode = ref(false)
let holdTimer = null
const isPlaying = ref(false)
const darkMode = ref(false)

const apps = [
  { name: 'Phone', icon: 'bi bi-telephone-fill', bg: '#34c759', badge: 2 },
  { name: 'Safari', icon: 'bi bi-compass-fill', bg: '#0a84ff' },
  { name: 'Music', icon: 'bi bi-music-note-beamed', bg: '#ff375f' },
  { name: 'Settings', icon: 'bi bi-gear-fill', bg: '#8e8e93' },
  { name: 'TikTok', icon: '', bg: '#000000' },
  { name: 'Pinterest', icon: 'bi bi-grid-3x3-gap-fill', bg: '#e60023' }, // <-- Thêm Pinterest đây
  { name: 'Lock', icon: 'bi bi-lock-fill', bg: '#333333' },
  { name: 'YouTube', icon: 'bi bi-youtube', bg: '#FF0000' }
]

const dockApps = [
  { name: 'Phone', icon: 'bi bi-telephone-fill', bg: '#34c759' },
  { name: 'Safari', icon: 'bi bi-compass-fill', bg: '#0a84ff' },
  { name: 'Music', icon: 'bi bi-music-note-beamed', bg: '#ff375f' },
  { name: 'Settings', icon: 'bi bi-gear-fill', bg: '#8e8e93' }
]

const openApp = (app) => {
  if (jiggleMode.value) return
  if (app.name === 'Lock') {
    activeApp.value = null
    jiggleMode.value = false
    emit('lock')
  } else {
    activeApp.value = app
  }
}

const closeApp = () => {
  activeApp.value = null
}

const startHold = () => {
  holdTimer = setTimeout(() => {
    jiggleMode.value = true
  }, 600)
}
const cancelHold = () => {
  clearTimeout(holdTimer)
}

const toggleMusic = () => {
  isPlaying.value = !isPlaying.value
}
</script>

<style scoped>
/* Toàn bộ style giữ nguyên như cũ */

/* Chỉ thêm style cho logo TikTok */
.tiktok-logo {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 8px rgba(255, 0, 80, 0.6));
}

/* Các style khác giữ nguyên */
.home-screen {
  width: 100%;
  height: 100%;
  padding-top: 70px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  padding: 0 18px;
}

.app-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.65rem;
  color: white;
}

.icon-bg {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 6px 10px rgba(0,0,0,.35);
  margin-bottom: 4px;
}

.icon-bg i {
  font-size: 1.4rem;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff3b30;
  color: white;
  font-size: 0.6rem;
  padding: 2px 5px;
  border-radius: 10px;
}

.dock {
  margin: 0 14px 16px;
  height: 60px;
  background: rgba(255,255,255,.18);
  backdrop-filter: blur(12px);
  border-radius: 22px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.dock-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dock-icon i {
  font-size: 1.5rem;
}

.app-screen {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.95);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  cursor: pointer;
}

.app-screen:hover .back-button {
  opacity: 1;
  pointer-events: auto;
}

.app-header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  color: white;
  background: rgba(0,0,0,0.85);
}

.app-header button {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.lock-app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.app-content iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}

.app-enter-active {
  transition: all .3s ease;
}

.app-enter-from {
  opacity: 0;
  transform: scale(.9);
}

.jiggle .app-icon {
  animation: jiggle .25s infinite alternate;
}

@keyframes jiggle {
  from { transform: rotate(-1deg); }
  to { transform: rotate(1deg); }
}
</style>