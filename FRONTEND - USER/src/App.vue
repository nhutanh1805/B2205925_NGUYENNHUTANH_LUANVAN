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

    <!-- Community Sidebar -->
    <CommunitySidebar v-if="ui.sidebar" />

    <!-- MODEL VIEWER -->
    <ModelViewer v-if="ui.model" />
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";
import Iphone from "@/components/iphone/Iphone.vue";
import TimeOnPage from "@/components/timeonpage/TimeOnPage.vue";
import IdleToast from "@/components/idle/IdleToast.vue";
import { initIdleDetector } from "@/components/idle/IdleDetector";
import ModelViewer from "@/components/ModelViewer/ModelViewer.vue";
import CommunitySidebar from "@/components/sidebar/CommunitySidebar.vue";

export default {
  name: "App",
  components: {
    AppHeader,
    TimeOnPage,
    Iphone,
    IdleToast,
    ModelViewer,
    CommunitySidebar,
  },
  data() {
    return {
      ui: {
        time: localStorage.getItem("ui_time") === "true",
        iphone: localStorage.getItem("ui_iphone") === "true",
        idle: localStorage.getItem("ui_idle") === "true",
        model: localStorage.getItem("ui_model") === "true",
        sidebar: localStorage.getItem("ui_sidebar") === "true", // <-- thêm đây
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
      localStorage.setItem("ui_model", this.ui.model);
      localStorage.setItem("ui_sidebar", this.ui.sidebar); // <-- lưu sidebar
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
