<template>
  <div id="app" :class="{ 'dark-mode': ui.dark }">

    <!-- ================= HEADER ================= -->
    <AppHeader
      :ui="ui"
      @update-ui="updateUI"
    />

    <!-- ================= MAIN CONTENT ================= -->
    <main class="app-container">
      <router-view />
    </main>

    <!-- ================= EXTRA UI ================= -->
    <TimeOnPage v-if="ui.time" />

    <Iphone v-if="ui.iphone" />
    <ChatbotPopup />
    <IdleToast
      v-if="ui.idle"
      ref="idleToast"
    />

    <CommunitySidebar v-if="ui.sidebar" />

    <ModelViewer v-if="ui.model" />
<ChatbotTuvan />
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
import ChatbotPopup from "@/components/ChatbotPopup.vue";
import ChatbotTuvan from "@/components/ChatbotTuvan.vue";  
export default {
  name: "App",

  components: {
    AppHeader,
    TimeOnPage,
    Iphone,
    IdleToast,
    ModelViewer,
    CommunitySidebar,
    ChatbotPopup,
    ChatbotTuvan,
  },

  data() {
    return {
      ui: {
        time: localStorage.getItem("ui_time") === "true",
        iphone: localStorage.getItem("ui_iphone") === "true",
        idle: localStorage.getItem("ui_idle") === "true",
        model: localStorage.getItem("ui_model") === "true",
        sidebar: localStorage.getItem("ui_sidebar") === "true",
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
      localStorage.setItem("ui_sidebar", this.ui.sidebar);
      localStorage.setItem("darkMode", this.ui.dark);
      localStorage.setItem("language", this.ui.lang);
    },
  },

  watch: {
    "ui.dark"(val) {
      document.documentElement.classList.toggle("dark", val);
    },
  },

  mounted() {
    // init dark mode
    if (this.ui.dark) {
      document.documentElement.classList.add("dark");
    }

    // idle detector
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

/* ================= GLOBAL RESET ================= */

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* ================= APP LAYOUT ================= */

.app-container {
  width: 100%;
  min-height: 100vh;
  padding: 0;
}

/* Fix Bootstrap trắng 2 bên */
body {
  overflow-x: hidden;
}

/* ================= DARK MODE ================= */

.dark-mode {
  background: #0f172a;
  color: #e5e7eb;
  transition: all 0.3s ease;
}

</style>