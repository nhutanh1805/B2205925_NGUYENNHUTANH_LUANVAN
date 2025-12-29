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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.admin-dashboard {
  max-width: 600px;
  margin: 60px auto;
  padding: 0 20px;
  font-family: 'Inter', sans-serif;
  text-align: center;
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 32px;
}

.card {
  padding: 32px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff, #f0f4ff);
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.card p {
  font-size: 1rem;
  color: #334155;
  margin-bottom: 12px;
}

.card b {
  color: #1e293b;
}
</style>
