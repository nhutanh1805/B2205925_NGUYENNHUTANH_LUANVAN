<template>
  <div class="user-dashboard">
    <h1>Thông tin User</h1>

    <div class="card" v-if="user">
      <p><b>Tên:</b> {{ user.name }}</p>
      <p><b>Email:</b> {{ user.email }}</p>
      <p><b>Quyền:</b> {{ user.role }}</p>
      <button @click="logout">Đăng xuất</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref(null);

onMounted(() => {
  const data = localStorage.getItem("user");
  if (!data) {
    router.push("/user/login");
    return;
  }
  user.value = JSON.parse(data);
});

function logout() {
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("user-logout"));
  router.push("/user/login");
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.user-dashboard {
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

.card button {
  margin-top: 16px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: #ef4444;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.card button:hover {
  background: #dc2626;
}
</style>
