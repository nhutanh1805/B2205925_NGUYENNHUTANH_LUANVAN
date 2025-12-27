<template>
  <div
    class="dynamic-island"
    :class="{ expanded: isOpen, active: isRunning }"
    @click="toggle"
  >
    <!-- Camera -->
    <div class="camera"></div>

    <!-- Nội dung -->
    <div class="island-content" v-if="isOpen">
      <i class="bi bi-stopwatch"></i>
      <span>{{ time }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";

const isOpen = ref(false);
const isRunning = ref(false);
const seconds = ref(0);
const time = ref("00:00");
let timer = null;

const formatTime = (s) => {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
};

const startTimer = () => {
  timer = setInterval(() => {
    seconds.value++;
    time.value = formatTime(seconds.value);
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timer);
  timer = null;
  seconds.value = 0;
  time.value = "00:00";
};

const toggle = () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    isRunning.value = true;
    startTimer();
  } else {
    isRunning.value = false;
    stopTimer();
  }
};

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
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

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    width 0.35s cubic-bezier(.4,0,.2,1),
    height 0.35s cubic-bezier(.4,0,.2,1);
}

/* Mở rộng */
.dynamic-island.expanded {
  width: 170px;
  height: 36px;
}

/* Pulse khi đang chạy */
.dynamic-island.active {
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 10px rgba(255,255,255,0.4); }
  100% { box-shadow: 0 0 0 rgba(255,255,255,0.2); }
}

/* Camera */
.camera {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #444, #000);
}

/* Content */
.island-content {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 0.7rem;
  opacity: 0;
  animation: fadeIn 0.25s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}
</style>
