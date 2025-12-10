<template>
  <div id="app">
    <AppHeader />

    <div class="container app-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";

export default {
  name: "App",
  components: { AppHeader },
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
