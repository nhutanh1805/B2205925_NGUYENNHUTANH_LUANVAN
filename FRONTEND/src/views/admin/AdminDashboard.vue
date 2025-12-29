<template>
  <div class="admin-dashboard">
    <h1>Thông tin Admin</h1>

    <div class="card" v-if="admin">
      <p><b>Tên:</b> {{ admin.name }}</p>
      <p><b>Email:</b> {{ admin.email }}</p>
      <p><b>Quyền:</b> {{ admin.role }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const admin = ref(null);

onMounted(() => {
  const data = localStorage.getItem("admin");
  if (!data) {
    router.push("/admin/login");
    return;
  }
  admin.value = JSON.parse(data);
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 600px;
  margin: 60px auto;
}

.card {
  padding: 24px;
  border-radius: 16px;
  background: #f9fafb;
  box-shadow: 0 10px 25px rgba(0,0,0,.08);
}
</style>
