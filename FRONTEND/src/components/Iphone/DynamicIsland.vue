<template>
  <div
    class="dynamic-island"
    :class="[stateClass, { active: isRunning && currentState === 'stopwatch' }]"
    @click="handleClick"
  >
    <!-- Camera dot - luôn hiện -->
    <div class="camera"></div>


    <!-- STOPWATCH -->
    <Transition name="content-fade">
      <div v-if="currentState === 'stopwatch'" class="island-content">
        <i class="bi bi-stopwatch"></i>
        <span>{{ swTime }}</span>
      </div>
    </Transition>

    <!-- FACE ID: SCANNING -->
    <Transition name="content-fade">
      <div v-if="currentState === 'faceid-scanning'" class="island-content faceid-content">
        <div class="ir-dots">
          <span
            v-for="i in 5" :key="i"
            class="ir-dot"
            :style="{ animationDelay: i * 0.09 + 's' }"
          ></span>
        </div>
        <div class="scan-line"></div>
        <span class="faceid-label">Face ID</span>
      </div>
    </Transition>

    <!-- FACE ID: SUCCESS -->
    <Transition name="content-fade">
      <div v-if="currentState === 'faceid-success'" class="island-content faceid-content">
        <svg class="checkmark" viewBox="0 0 28 28">
          <circle class="check-circle" cx="14" cy="14" r="12" fill="none"/>
          <path  class="check-tick"   fill="none" d="M8 14 l4 4 8-9"/>
        </svg>
        <span class="faceid-label success-text">Đã mở khoá</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";

// ── Props ──
const props = defineProps({
  // null bình thường; khi LockScreen vuốt đủ → parent truyền vào một Function (unlockCallback)
  faceIdCallback: { type: Function, default: null },
});

// ── State machine ──
// 'idle' | 'stopwatch' | 'faceid-scanning' | 'faceid-success'
const currentState = ref("idle");
const isRunning    = ref(false);

const stateClass = computed(() => ({
  expanded:          currentState.value === "stopwatch",
  "faceid-scanning": currentState.value === "faceid-scanning",
  "faceid-success":  currentState.value === "faceid-success",
}));

// ── Stopwatch (chức năng gốc giữ nguyên) ──
const swSeconds = ref(0);
const swTime    = ref("00:00");
let swTimer = null;

const formatTime = (s) => {
  const m   = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
};

const startSW = () => {
  swTimer = setInterval(() => {
    swSeconds.value++;
    swTime.value = formatTime(swSeconds.value);
  }, 1000);
};

const stopSW = () => {
  clearInterval(swTimer);
  swTimer = null;
  swSeconds.value = 0;
  swTime.value = "00:00";
};

// Click: toggle stopwatch (chỉ khi không đang Face ID)
const handleClick = () => {
  if (currentState.value.startsWith("faceid")) return;

  if (currentState.value === "idle") {
    currentState.value = "stopwatch";
    isRunning.value = true;
    startSW();
  } else if (currentState.value === "stopwatch") {
    currentState.value = "idle";
    isRunning.value = false;
    stopSW();
  }
};

// ── Face ID: watch prop từ parent ──
watch(
  () => props.faceIdCallback,
  (cb) => {
    if (!cb) return;

    // Dừng stopwatch nếu đang chạy
    if (currentState.value === "stopwatch") {
      stopSW();
      isRunning.value = false;
    }

    // Bắt đầu scanning
    currentState.value = "faceid-scanning";

    // 1.8s scanning → success
    setTimeout(() => {
      currentState.value = "faceid-success";

      // 0.75s success → gọi callback unlock rồi về idle
      setTimeout(() => {
        cb();                           // → emit('unlock') trong LockScreen/LeftSidebar
        currentState.value = "idle";
      }, 750);
    }, 1800);
  }
);

onUnmounted(() => stopSW());
</script>

<style scoped>
/* ── Base pill ── */
.dynamic-island {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 22px;
  background: #000;
  border-radius: 18px;
  z-index: 30;
  cursor: pointer;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    width  0.42s cubic-bezier(0.34, 1.46, 0.64, 1),
    height 0.42s cubic-bezier(0.34, 1.46, 0.64, 1),
    border-radius 0.35s ease,
    box-shadow 0.3s ease;
}

/* Stopwatch expanded (giữ nguyên class gốc) */
.dynamic-island.expanded {
  width: 170px;
  height: 36px;
}

/* Face ID scanning */
.dynamic-island.faceid-scanning {
  width: 175px;
  height: 36px;
  border-radius: 22px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

/* Face ID success */
.dynamic-island.faceid-success {
  width: 165px;
  height: 34px;
  border-radius: 20px;
  box-shadow: 0 0 18px rgba(48, 209, 88, 0.4);
}

/* Pulse khi stopwatch đang chạy */
.dynamic-island.active {
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 rgba(255,255,255,0.2); }
  50%      { box-shadow: 0 0 10px rgba(255,255,255,0.4); }
}

/* ── Camera (giữ nguyên gốc) ── */
.camera {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #444, #000);
  z-index: 2;
}

/* ── Content chung ── */
.island-content {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 0.7rem;
  padding-right: 18px; /* tránh đè camera */
}

/* ── Face ID content ── */
.faceid-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  padding-right: 20px;
}

/* IR dots */
.ir-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.ir-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: dotPulse 1s ease-in-out infinite alternate;
}

@keyframes dotPulse {
  from { opacity: 0.2; transform: scale(0.7); }
  to   { opacity: 1;   transform: scale(1.2); box-shadow: 0 0 4px rgba(255,255,255,0.8); }
}

/* Scan line chạy ngang */
.scan-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), transparent);
  animation: scanAcross 1.6s linear infinite;
}

@keyframes scanAcross {
  from { left: 0; }
  to   { left: 100%; }
}

.faceid-label {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.68rem;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.03em;
}

.success-text { color: #30d158; }

/* ── Checkmark SVG ── */
.checkmark { width: 20px; height: 20px; flex-shrink: 0; }

.check-circle {
  stroke: #30d158;
  stroke-width: 2;
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: drawCircle 0.4s ease forwards;
}

.check-tick {
  stroke: #30d158;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: drawTick 0.3s ease 0.35s forwards;
}

@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawTick   { to { stroke-dashoffset: 0; } }

/* ── Transitions ── */
.content-fade-enter-active { transition: opacity 0.2s ease 0.15s; }
.content-fade-leave-active { transition: opacity 0.1s ease; }
.content-fade-enter-from,
.content-fade-leave-to     { opacity: 0; }
</style>