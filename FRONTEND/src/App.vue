<template>
  <div id="app">
    <!-- HEADER TOÀN WEB -->
    <AppHeader
      :ui="ui"
      @update-ui="ui = $event"
    />

    <!-- NỘI DUNG TRANG -->
    <div class="container app-container">
      <router-view />
    </div>

    <!-- TIME ON PAGE -->
    <TimeOnPage v-if="ui.time" />

    <!-- IPHONE UI -->
    <Iphone v-if="ui.iphone" />

    <!-- IDLE TOAST -->
    <IdleToast
      v-if="ui.idle"
      ref="idleToast"
    />
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";
import Iphone from "@/components/iphone/Iphone.vue";
import TimeOnPage from "@/components/timeonpage/TimeOnPage.vue";
import IdleToast from "@/components/idle/IdleToast.vue";
import { initIdleDetector } from "@/components/idle/IdleDetector";

export default {
  name: "App",
  components: {
    AppHeader,
    TimeOnPage,
    Iphone,
    IdleToast,
  },
  data() {
    return {
      ui: {
        time: true,
        iphone: true,
        idle: true,
      },
    };
  },
  mounted() {
    initIdleDetector({
      idleTime: 3000,
      onIdleCallback: () => {
        if (this.ui.idle) {
          this.$refs.idleToast?.show();
        }
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
