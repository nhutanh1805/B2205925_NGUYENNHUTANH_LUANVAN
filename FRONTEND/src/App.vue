<template>
  <div id="app">
    <!-- HEADER TOÀN WEB -->
    <AppHeader />

    <!-- NỘI DUNG TRANG -->
    <div class="container app-container">
      <router-view />
    </div>

    <TimeOnPage />

    <!-- Compoment Iphone -->
    <Iphone />

    <!-- Compoment Thông báo đứng im 5s -->
    <IdleToast ref="idleToast" />
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";
import Iphone from "@/components/iphone/Iphone.vue"; // Compoments Iphone
import TimeOnPage from "@/components/timeonpage/TimeOnPage.vue"; //
// Compoments Thông báo đứng im
import IdleToast from "@/components/idle/IdleToast.vue";
import { initIdleDetector } from "@/components/idle/IdleDetector";

export default {
  name: "App",
  components: {
    AppHeader,
    TimeOnPage,
    Iphone, // Compoments Iphone
    IdleToast, // Compoments Thông báo đứng im
  },
  mounted() {
    initIdleDetector({
      idleTime: 3000, // 3 giây
      onIdleCallback: () => {
        this.$refs.idleToast?.show();
      },
    });
  },
};
</script>

<style>
body {
  background-color: #f8f9fa;
  font-family: "Segoe UI", sans-serif;
  margin: 0;
}

.app-container {
  max-width: 1200px;
  margin-top: 24px;
  padding-bottom: 40px;
}
</style>
