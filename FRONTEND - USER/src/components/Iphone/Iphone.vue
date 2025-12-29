<template>
  <aside class="left-sidebar">
    <div class="iphone-wrapper">

      <!-- VIDEO khi LOCK -->
      <video
        v-if="!isUnlocked"
        class="bg-video"
        autoplay
        muted
        loop
        playsinline
        src="@/assets/video/Video4.mp4"
      ></video>

      <!-- IMAGE khi UNLOCK -->
      <div
        v-else
        class="bg-image"
        :style="{ backgroundImage: `url(${homeBgImg})` }"
      ></div>

      <!-- DYNAMIC ISLAND & STATUS BAR LUÔN HIỆN Ở TRÊN CÙNG -->
      <div class="status-bar-wrapper">
        <StatusBar />
        <DynamicIsland />
      </div>

      <!-- LOCK SCREEN -->
      <transition name="unlock">
        <LockScreen
          v-if="!isUnlocked"
          :time="time"
          :date="date"
          @unlock="unlock"
        />
      </transition>

      <!-- HOME SCREEN -->
      <transition name="home">
        <HomeScreen v-if="isUnlocked" @lock="lockScreen" />
      </transition>

      <!-- BottomIcons chỉ hiện khi lock -->
      <BottomIcons v-if="!isUnlocked" />

      <!-- HomeIndicator LUÔN HIỆN, đặt CUỐI CÙNG để nằm trên cùng mọi thứ -->
      <HomeIndicator class="home-indicator-overlay" />

    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DynamicIsland from "./DynamicIsland.vue";
import StatusBar from "./StatusBar.vue";
import LockScreen from "./LockScreen.vue";
import BottomIcons from "./BottomIcons.vue";
import HomeIndicator from "./HomeIndicator.vue";
import HomeScreen from "./HomeScreen.vue";

import homeBgImg from "@/assets/img/BackIphone.jpg"; 

const time = ref("");
const date = ref("");
const isUnlocked = ref(false);

// Mở khóa
const unlock = () => {
  isUnlocked.value = true;
};

// Khóa màn hình
const lockScreen = () => {
  isUnlocked.value = false;
};

const updateDateTime = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  date.value = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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
  width: 240px;
  height: 520px;
  z-index: 1000;
}

.iphone-wrapper {
  width: 100%;
  height: 100%;
  border: 6px solid rgba(17,17,17,.9);
  border-radius: 45px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,.5);
}

/* VIDEO BACKGROUND khi khóa */
.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* IMAGE BACKGROUND khi mở khóa */
.bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

/* STATUS BAR & DYNAMIC ISLAND LUÔN Ở TRÊN CÙNG */
.status-bar-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999; /* Cao nhất để không bị app che */
}

/* === THÊM STYLE ĐỂ HOME INDICATOR LUÔN NẰM TRÊN CÙNG === */
.home-indicator-overlay {
  position: absolute !important;
  bottom: 4px !important;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999 !important; /* Cao hơn tất cả, kể cả app-screen có z-index 50 */
  pointer-events: none; /* Không chặn tương tác với app bên dưới */
}

/* Transitions */
.unlock-leave-active {
  transition: all 0.35s ease;
}
.unlock-leave-to {
  opacity: 0;
  transform: translateY(-32px) scale(1.06);
  filter: blur(6px);
}

.home-enter-active {
  transition: all 0.35s ease;
}
.home-enter-from {
  opacity: 0;
  transform: scale(1.08);
}
</style>