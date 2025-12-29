<template>
  <div class="auth">
    <h2>Tạo Admin</h2>

    <input v-model="name" placeholder="Tên" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="register">Tạo</button>

    <p v-if="message">{{ message }}</p>
    <p class="error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import AdminAuthService from "@/services/adminAuth.service";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      message: "",
      error: "",
    };
  },
  methods: {
    async register() {
      try {
        const res = await AdminAuthService.register({
          name: this.name,
          email: this.email,
          password: this.password,
        });
        this.message = res.message;
        this.error = "";
      } catch (err) {
        this.error = err.response?.data?.message || "Tạo admin thất bại";
      }
    },
  },
};
</script>
