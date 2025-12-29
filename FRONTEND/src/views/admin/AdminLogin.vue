<template>
  <div class="auth">
    <h2>Admin Login</h2>

    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="login">Đăng nhập</button>

    <p class="error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import AdminAuthService from "@/services/adminAuth.service";

export default {
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async login() {
      try {
        const res = await AdminAuthService.login({
          email: this.email,
          password: this.password,
        });

        localStorage.setItem("admin", JSON.stringify(res.admin));

        window.dispatchEvent(new Event("admin-login"));

        this.$router.push("/admin");
      } catch (err) {
        this.error = err.response?.data?.message || "Đăng nhập thất bại";
      }
    },
  },
};
</script>

<style scoped>
.auth {
  max-width: 400px;
  margin: 100px auto;
  padding: 24px;
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.1);
  text-align: center;
}

input {
  width: 100%;
  padding: 10px 14px;
  margin: 12px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #2563eb;
}

.error {
  color: red;
  margin-top: 12px;
  font-weight: 600;
}
</style>
