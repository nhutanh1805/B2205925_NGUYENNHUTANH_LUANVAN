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
          <i :class="app.icon"></i>
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

        <div v-if="activeApp.name !== 'Settings'" class="app-header">
          <button @click="closeApp">←</button>
          <span>{{ activeApp.name }}</span>
        </div>

        <div class="app-content no-scrollbar">
          <template v-if="activeApp.name === 'Pinterest'">
            <PinterestApp @close="closeApp" />
          </template>

          <template v-else-if="activeApp.name === 'Settings'">
            <SettingsApp @close="closeApp" />
          </template>

          <template v-else-if="activeApp.name === 'Shipper'">
            <ShipperApp @close="closeApp" />
          </template>

          <!-- Camera -->
          <template v-else-if="activeApp.name === 'Camera'">
            <div class="mock-app">
              <div class="mock-camera-view">
                <i class="bi bi-camera-fill"></i>
                <p>Camera</p>
              </div>
              <div class="mock-camera-bar">
                <div class="shutter-btn"></div>
              </div>
            </div>
          </template>

          <!-- Messages -->
          <template v-else-if="activeApp.name === 'Messages'">
            <div class="mock-app mock-messages">
              <div class="msg-item" v-for="m in messages" :key="m.name">
                <div class="msg-avatar" :style="{ background: m.color }">{{ m.name[0] }}</div>
                <div class="msg-body">
                  <div class="msg-name">{{ m.name }}</div>
                  <div class="msg-text">{{ m.text }}</div>
                </div>
                <div class="msg-time">{{ m.time }}</div>
              </div>
            </div>
          </template>

          <!-- Photos -->
          <template v-else-if="activeApp.name === 'Photos'">
            <div class="mock-app mock-photos">
              <div class="photo-grid">
                <div class="photo-item" v-for="n in 12" :key="n" :style="{ background: photoColors[n % photoColors.length] }">
                  <i class="bi bi-image"></i>
                </div>
              </div>
            </div>
          </template>

          <!-- Weather -->
          <template v-else-if="activeApp.name === 'Weather'">
            <div class="mock-app mock-weather">
              <div class="weather-city">Vĩnh Long</div>
              <div class="weather-temp">32°</div>
              <div class="weather-desc">Nắng nhẹ</div>
              <div class="weather-row">
                <div class="weather-day" v-for="d in weatherDays" :key="d.day">
                  <span class="wd-day">{{ d.day }}</span>
                  <i :class="d.icon"></i>
                  <span class="wd-temp">{{ d.temp }}°</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Clock -->
          <template v-else-if="activeApp.name === 'Clock'">
            <div class="mock-app mock-clock">
              <div class="clock-face">
                <div class="clock-time">{{ currentTime }}</div>
                <div class="clock-date">{{ currentDate }}</div>
              </div>
              <div class="clock-alarms">
                <div class="alarm-item" v-for="a in alarms" :key="a.time">
                  <span class="alarm-time">{{ a.time }}</span>
                  <span class="alarm-label">{{ a.label }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Calculator -->
          <template v-else-if="activeApp.name === 'Calculator'">
            <div class="mock-app mock-calc">
              <div class="calc-display">{{ calcDisplay }}</div>
              <div class="calc-grid">
                <button v-for="btn in calcBtns" :key="btn" class="calc-btn"
                  :class="{
                    'calc-op': ['÷','×','-','+','='].includes(btn),
                    'calc-fn': ['AC','±','%'].includes(btn),
                    'calc-zero': btn === '0'
                  }"
                  @click="calcPress(btn)"
                >{{ btn }}</button>
              </div>
            </div>
          </template>

          <!-- Maps -->
          <template v-else-if="activeApp.name === 'Maps'">
            <div class="mock-app mock-maps">
              <div class="maps-view">
                <div class="maps-grid"></div>
                <div class="maps-pin"><i class="bi bi-geo-alt-fill"></i></div>
                <div class="maps-label">Vĩnh Long, Việt Nam</div>
              </div>
              <div class="maps-bar">
                <i class="bi bi-search"></i>
                <span>Tìm kiếm địa điểm...</span>
              </div>
            </div>
          </template>

          <!-- Notes -->
          <template v-else-if="activeApp.name === 'Notes'">
            <div class="mock-app mock-notes">
              <div class="note-item" v-for="n in notes" :key="n.title">
                <div class="note-title">{{ n.title }}</div>
                <div class="note-preview">{{ n.preview }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="activeApp.name === 'Lock'">
            <div class="lock-app-content">
              <i class="bi bi-lock-fill fs-1 text-white mb-4"></i>
              <p>Đang khóa màn hình...</p>
            </div>
          </template>

          <template v-else>
            <div style="color:white;padding:20px">
              <p>{{ activeApp.name }}</p>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PinterestApp from './PinterestApp.vue'
import ShipperApp from './ShipperApp.vue'
import SettingsApp from './SettingsApp.vue'

const emit = defineEmits(['lock'])

const activeApp = ref(null)
const jiggleMode = ref(false)
let holdTimer = null

const apps = [
  // Hàng 1
  { name: 'Settings',   icon: 'bi bi-gear-fill',            bg: '#8e8e93' },
  { name: 'Pinterest',  icon: 'bi bi-grid-3x3-gap-fill',    bg: '#e60023' },
  { name: 'Shipper',    icon: 'bi bi-bicycle',              bg: 'linear-gradient(135deg, #1a1f3c, #4f46e5)' },
  // Hàng 2
  { name: 'Camera',     icon: 'bi bi-camera-fill',          bg: '#1c1c1e' },
  { name: 'Messages',   icon: 'bi bi-chat-fill',            bg: '#34c759', badge: 3 },
  { name: 'Photos',     icon: 'bi bi-images',               bg: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  // Hàng 3
  { name: 'Weather',    icon: 'bi bi-cloud-sun-fill',       bg: 'linear-gradient(135deg, #2980b9, #6dd5fa)' },
  { name: 'Clock',      icon: 'bi bi-clock-fill',           bg: '#1c1c1e' },
  { name: 'Calculator', icon: 'bi bi-calculator-fill',      bg: '#1c1c1e' },
  // Hàng 4
  { name: 'Maps',       icon: 'bi bi-map-fill',             bg: 'linear-gradient(135deg, #56ab2f, #a8e063)' },
  { name: 'Notes',      icon: 'bi bi-journal-text',         bg: '#ffd60a' },
]

const dockApps = [
  { name: 'Settings', icon: 'bi bi-gear-fill', bg: '#8e8e93' },
  { name: 'Lock',     icon: 'bi bi-lock-fill', bg: '#333333' },
  { name: 'Camera',   icon: 'bi bi-camera-fill', bg: '#1c1c1e' },
]

// Messages
const messages = [
  { name: 'Nhựt Anh', text: 'Ok bro, tí gặp nha!',   time: '9:41',    color: '#007aff' },
  { name: 'Mẹ',        text: 'Con ăn cơm chưa?',       time: '9:20',    color: '#ff2d55' },
  { name: 'Nhóm lớp',  text: 'Có ai làm BT chưa?',    time: 'Hôm qua', color: '#34c759' },
  { name: 'Bạn',   text: '😂😂 oke hen',           time: 'Hôm qua', color: '#ff9500' },
]

// Photos
const photoColors = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#00d2d3','#ff9f43','#10ac84','#ee5a24','#0abde3','#c8d6e5']

// Weather
const weatherDays = [
  { day: 'T2', icon: 'bi bi-sun-fill',        temp: 33 },
  { day: 'T3', icon: 'bi bi-cloud-sun-fill',  temp: 30 },
  { day: 'T4', icon: 'bi bi-cloud-rain-fill', temp: 27 },
  { day: 'T5', icon: 'bi bi-sun-fill',        temp: 34 },
  { day: 'T6', icon: 'bi bi-cloud-fill',      temp: 29 },
]

// Clock
const now = new Date()
const currentTime = ref(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const currentDate = ref(now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }))
const alarms = [
  { time: '6:00', label: 'Thức dậy' },
  { time: '7:30', label: 'Đi học' },
]

// Calculator
const calcDisplay = ref('0')
const calcBtns = ['AC','±','%','÷','7','8','9','×','4','5','6','-','1','2','3','+','0','.','=']
let calcPrev = '', calcOp = '', calcNew = true

function calcPress(btn) {
  if (btn === 'AC') { calcDisplay.value = '0'; calcPrev = ''; calcOp = ''; calcNew = true; return }
  if (['÷','×','-','+'].includes(btn)) { calcPrev = calcDisplay.value; calcOp = btn; calcNew = true; return }
  if (btn === '=') {
    const a = parseFloat(calcPrev), b = parseFloat(calcDisplay.value)
    const res = calcOp === '÷' ? a/b : calcOp === '×' ? a*b : calcOp === '-' ? a-b : a+b
    calcDisplay.value = String(parseFloat(res.toFixed(8))); calcNew = true; return
  }
  if (btn === '±') { calcDisplay.value = String(-parseFloat(calcDisplay.value)); return }
  if (btn === '%') { calcDisplay.value = String(parseFloat(calcDisplay.value)/100); return }
  if (calcNew) { calcDisplay.value = btn === '.' ? '0.' : btn; calcNew = false }
  else {
    if (btn === '.' && calcDisplay.value.includes('.')) return
    calcDisplay.value = calcDisplay.value === '0' && btn !== '.' ? btn : calcDisplay.value + btn
  }
}

// Notes
const notes = [
  { title: 'Danh sách mua sắm',  preview: 'Sữa, trứng, bánh mì...' },
  { title: 'Ý tưởng project',    preview: 'App quản lý chi tiêu cá nhân' },
  { title: 'Việc cần làm',       preview: 'Hoàn thành luận văn' },
  { title: 'Ghi chú học',        preview: 'Vue 3 Composition API...' },
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

const closeApp = () => { activeApp.value = null }
const startHold = () => { holdTimer = setTimeout(() => { jiggleMode.value = true }, 600) }
const cancelHold = () => { clearTimeout(holdTimer) }
</script>

<style scoped>
.home-screen {
  width: 100%; height: 100%;
  padding-top: 70px;
  display: flex; flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 0 14px;
}

.app-icon {
  display: flex; flex-direction: column;
  align-items: center;
  font-size: 0.65rem; color: white; cursor: pointer;
}

.icon-bg {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  box-shadow: 0 6px 10px rgba(0,0,0,.35);
  margin-bottom: 4px;
}
.icon-bg i { font-size: 1.4rem; color: white; }

.badge {
  position: absolute; top: -6px; right: -6px;
  background: #ff3b30; color: white;
  font-size: 0.6rem; padding: 2px 5px; border-radius: 10px;
}

.dock {
  margin: 0 14px 16px; height: 60px;
  background: rgba(255,255,255,.18);
  backdrop-filter: blur(12px); border-radius: 22px;
  display: flex; justify-content: space-around; align-items: center;
}
.dock-icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.dock-icon i { font-size: 1.5rem; color: white; }

.app-screen {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.95);
  z-index: 50; display: flex; flex-direction: column;
}

.back-button {
  position: absolute; top: 20px; left: 16px;
  width: 36px; height: 36px;
  background: rgba(0,0,0,.6); backdrop-filter: blur(10px);
  border: none; border-radius: 50%;
  color: white; font-size: 1.4rem;
  display: flex; align-items: center; justify-content: center;
  z-index: 100; opacity: 0; transition: opacity 0.3s ease;
  pointer-events: none; cursor: pointer;
}
.app-screen:hover .back-button { opacity: 1; pointer-events: auto; }

.app-header {
  height: 44px; display: flex; align-items: center;
  padding: 0 12px; gap: 8px;
  color: white; background: rgba(0,0,0,0.85);
}
.app-header button { background: none; border: none; color: white; font-size: 1.2rem; }

.app-content { flex: 1; overflow-y: auto; }

/* MOCK BASE */
.mock-app {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: #1c1c1e; color: white;
}

/* CAMERA */
.mock-camera-view {
  flex: 1; background: #000;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: rgba(255,255,255,.3); font-size: .8rem; gap: 8px;
}
.mock-camera-view i { font-size: 3rem; }
.mock-camera-bar {
  height: 80px; background: #000;
  display: flex; align-items: center; justify-content: center;
}
.shutter-btn {
  width: 56px; height: 56px; border-radius: 50%;
  background: white; border: 3px solid rgba(255,255,255,.4);
  box-shadow: 0 0 0 4px rgba(255,255,255,.15);
}

/* MESSAGES */
.mock-messages { padding: 8px 0; }
.msg-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.msg-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .9rem; flex-shrink: 0;
}
.msg-body { flex: 1; min-width: 0; }
.msg-name { font-size: .78rem; font-weight: 600; }
.msg-text { font-size: .7rem; color: rgba(255,255,255,.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.msg-time { font-size: .65rem; color: rgba(255,255,255,.3); flex-shrink: 0; }

/* PHOTOS */
.mock-photos { background: #000; padding: 2px; }
.photo-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; }
.photo-item {
  aspect-ratio: 1; display: flex;
  align-items: center; justify-content: center;
  color: rgba(255,255,255,.3); font-size: 1.2rem;
}

/* WEATHER */
.mock-weather {
  background: linear-gradient(180deg, #1a6ebd 0%, #2980b9 100%);
  align-items: center; justify-content: center; gap: 4px;
}
.weather-city { font-size: .9rem; opacity: .8; }
.weather-temp { font-size: 3.5rem; font-weight: 200; line-height: 1; }
.weather-desc { font-size: .75rem; opacity: .7; margin-bottom: 20px; }
.weather-row {
  display: flex; gap: 10px;
  border-top: 1px solid rgba(255,255,255,.2);
  padding-top: 12px; width: 100%; justify-content: space-around;
}
.weather-day { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.wd-day { font-size: .65rem; opacity: .7; }
.weather-day i { font-size: .9rem; }
.wd-temp { font-size: .72rem; font-weight: 600; }

/* CLOCK */
.mock-clock { background: #000; align-items: center; padding: 20px 14px; gap: 20px; }
.clock-face { text-align: center; }
.clock-time { font-size: 3rem; font-weight: 200; letter-spacing: -1px; }
.clock-date { font-size: .75rem; color: rgba(255,255,255,.5); }
.clock-alarms { width: 100%; display: flex; flex-direction: column; gap: 1px; }
.alarm-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255,255,255,.06); border-radius: 10px;
}
.alarm-time { font-size: 1.2rem; font-weight: 300; }
.alarm-label { font-size: .7rem; color: rgba(255,255,255,.45); }

/* CALCULATOR */
.mock-calc { background: #000; justify-content: flex-end; }
.calc-display {
  padding: 10px 20px; text-align: right;
  font-size: 2.5rem; font-weight: 200; color: white; word-break: break-all;
}
.calc-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #000; }
.calc-btn {
  height: 52px; border: none; cursor: pointer;
  font-size: 1.1rem; background: #333; color: white; transition: opacity .15s;
}
.calc-btn:active { opacity: .6; }
.calc-fn { background: #a5a5a5; color: #000; }
.calc-op { background: #ff9500; }
.calc-zero { grid-column: span 2; text-align: left; padding-left: 22px; }

/* MAPS */
.mock-maps { background: #2c2c2e; padding: 0; }
.maps-view {
  flex: 1; background: #3a3a3c; position: relative;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.maps-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
.maps-pin { position: relative; z-index: 2; font-size: 2rem; color: #ff3b30; }
.maps-label {
  position: absolute; bottom: 12px;
  background: rgba(0,0,0,.7); color: white;
  font-size: .7rem; padding: 4px 10px; border-radius: 10px; z-index: 2;
}
.maps-bar {
  height: 44px; background: #1c1c1e;
  display: flex; align-items: center; gap: 8px;
  padding: 0 14px; color: rgba(255,255,255,.4); font-size: .78rem;
}

/* NOTES */
.mock-notes { background: #ffd60a; padding: 8px 0; }
.note-item { padding: 10px 14px; border-bottom: 1px solid rgba(0,0,0,.1); }
.note-title { font-size: .78rem; font-weight: 700; color: #1c1c1e; }
.note-preview { font-size: .68rem; color: rgba(0,0,0,.45); margin-top: 2px; }

/* MISC */
.lock-app-content {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: white; font-size: 1.5rem;
}
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

.app-enter-active { transition: all .3s ease; }
.app-enter-from { opacity: 0; transform: scale(.9); }

.jiggle .app-icon { animation: jiggle .25s infinite alternate; }
@keyframes jiggle {
  from { transform: rotate(-1deg); }
  to   { transform: rotate(1deg); }
}
</style>