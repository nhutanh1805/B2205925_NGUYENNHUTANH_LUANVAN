<template>
  <div class="page text-center mt-5">
    <h2>404 - Không tìm thấy trang</h2>
    <router-link to="/" class="btn btn-primary mt-3">
      Quay về trang chủ
    </router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: auto;
}
</style>
