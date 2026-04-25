<template>
  <div id="app" :class="{ dark: ui.dark }">

    <!-- ================= HEADER ================= -->
    <AppHeader
      :ui="ui"
      @update-ui="updateUI"
    />

    <!-- ================= PAGE CONTENT ================= -->
    <main class="app-container">
      <router-view />
    </main>

    <!-- ================= GLOBAL UI ================= -->
    <TimeOnPage v-if="ui.time" />

    <Iphone v-if="ui.iphone" />

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
      document.documentElement.classList.toggle("dark", val);
    },
  },

  mounted() {
    // Init Dark Mode
    if (this.ui.dark) {
      document.documentElement.classList.add("dark");
    }

    // Idle detector
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

/* ================= RESET ================= */

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", sans-serif;
}

/* ================= GLOBAL BACKGROUND ================= */

body {
  background-color: #f8f9fa;
  transition: background 0.3s ease, color 0.3s ease;
}

.dark body {
  background-color: #121212;
  color: #e0e0e0;
}

/* ================= APP LAYOUT ================= */

.app-container {
  width: 100%;
  min-height: calc(100vh - 70px); /* trừ header */
  padding: 24px 0 40px;
}

/* Fix Bootstrap white edge */
body {
  overflow-x: hidden;
}

/* ================= SMOOTH TRANSITION ================= */

* {
  transition: background-color 0.25s ease,
              color 0.25s ease;
}

</style>