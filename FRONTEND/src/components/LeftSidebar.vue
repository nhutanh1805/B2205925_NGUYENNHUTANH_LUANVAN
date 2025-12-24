<template>
  <aside class="left-sidebar">
    <div class="iphone-wrapper" :style="{ backgroundImage: `url(${lockscreenImg})` }">
      <div class="dynamic-island">
        <span class="current-time">{{ time }}</span>
        <div class="status-icons">
          <i class="bi bi-wifi"></i>
          <i class="bi bi-battery-full"></i>
        </div>
      </div>
      <div class="screen">
        <div class="lock-screen">
          <div class="time">{{ time }}</div>
          <div class="date">{{ date }}</div>
        </div>
      </div>
      <div class="home-indicator"></div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import lockscreenImg from '@/assets/img/BackIPhone.jpg';

const time = ref('');
const date = ref('');

const updateDateTime = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  date.value = now.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' });
};

onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 60000);
});
</script>

<style scoped>
.left-sidebar {
  position: fixed;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 240px; /* Chiều rộng iphone */
  height: 520px; /* Chiều dài iphone */
  display: block;
  z-index: 1000;
}

.iphone-wrapper {
  width: 100%;
  height: 100%;
  border: 6px solid rgba(17,17,17,0.9); /* Viền iphone */
  border-radius: 45px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}

.dynamic-island {
  width: 90px;
  height: 23px;
  background: rgba(34,34,34,0.85);
  border-radius: 18px;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  color: #fff;
  font-size: 0.8rem;
  z-index: 20;
  box-shadow: 0 0 6px rgba(255,255,255,0.1), 0 2px 5px rgba(0,0,0,0.3);
}

.dynamic-island:hover {
  background: rgba(34,34,34,1);
  box-shadow: 0 0 10px rgba(255,255,255,0.2), 0 3px 6px rgba(0,0,0,0.5);
}

.dynamic-island .current-time {
  font-weight: 500;
  font-size: 0.8rem;
}

.status-icons i {
  margin-left: 5px;
  font-size: 0.8rem;
}

.screen {
  width: 100%;
  height: calc(100% - 50px);
  margin-top: 30px;
  overflow: hidden;
  position: relative;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-screen {
  text-align: center;
  color: white;
  text-shadow: 0 0 10px rgba(0,0,0,0.6);
}

.lock-screen .time {
  font-size: 2.5rem;
  font-weight: 200;
  margin-bottom: 6px;
}

.lock-screen .date {
  font-size: 0.9rem;
  font-weight: 300;
}

.home-indicator {
  width: 85px;
  height: 4px;
  background: rgba(255, 255, 255, 1);
  border-radius: 10px;
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}
</style>
