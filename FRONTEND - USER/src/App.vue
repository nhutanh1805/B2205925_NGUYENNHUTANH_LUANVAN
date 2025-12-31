<template>
  <div id="app" :class="{ 'dark-mode': ui.dark }">
    <!-- HEADER TOÀN WEB -->
    <AppHeader
      :ui="ui"
      @update-ui="updateUI"
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
        time: localStorage.getItem("ui_time") === "true",
        iphone: localStorage.getItem("ui_iphone") === "true",
        idle: localStorage.getItem("ui_idle") === "true",
        dark: localStorage.getItem("darkMode") === "true",
        lang: localStorage.getItem("language") || "vi",
      },
    };
  },
  methods: {
    updateUI(newUI) {
      this.ui = { ...this.ui, ...newUI };
      localStorage.setItem("ui_time", this.ui.time);
      localStorage.setItem("ui_iphone", this.ui.iphone);
      localStorage.setItem("ui_idle", this.ui.idle);
      localStorage.setItem("darkMode", this.ui.dark);
      localStorage.setItem("language", this.ui.lang);
    },
  },
  watch: {
    "ui.dark"(val) {
      if (val) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
  mounted() {
    if (this.ui.dark) {
      document.documentElement.classList.add("dark");
    }

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
  transition: background-color 0.4s ease, color 0.4s ease;
}

.dark body {
  background-color: #121212;
  color: #e0e0e0;
}

.app-container {
  max-width: 1200px;
  margin-top: 24px;
  padding-bottom: 40px;
  transition: all 0.4s ease;
}

.dark .app-container {
  background-color: #121212;
}
</style>