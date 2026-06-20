<template>
  <div class="auth-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Chào mừng trở lại
        </div>
        <h1 class="hero-title">Đăng nhập<br/><em>tài khoản</em></h1>
        <p class="hero-sub">Tiếp tục mua sắm cùng chúng tôi</p>
      </div>
    </div>

    <div class="main-panel">
      <div class="auth-card">
        <h2 class="card-title">Thông tin đăng nhập</h2>

        <div class="field">
          <label class="field-label">Email</label>
          <input v-model="email" class="field-input" placeholder="@email.com" />
        </div>

        <div class="field">
          <label class="field-label">Mật khẩu</label>
          <input v-model="password" type="password" class="field-input" placeholder="••••••••" />
        </div>

        <button class="submit-btn" @click="login">
          Đăng nhập
          <span class="btn-shine"></span>
        </button>

        <p class="error" v-if="error">{{ error }}</p>

        <div class="register-link">
          <span>Chưa có tài khoản?</span>
          <button class="link-btn" @click="goRegister">Đăng ký</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import UserAuthService from "@/services/userAuth.service";

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
        const res = await UserAuthService.login({
          email: this.email,
          password: this.password,
        });
        localStorage.setItem("user", JSON.stringify(res.user));
        window.dispatchEvent(new Event("user-login"));
        this.$router.push("/user");
      } catch (err) {
        this.error = err.response?.data?.message || "Đăng nhập thất bại";
      }
    },
    goRegister() {
      this.$router.push("/user/register");
    },
  },
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 72px 32px 100px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.15); top: 40%; left: 55%; }

.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 22px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 8px #10b981;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
.hero-title {
  font-size: clamp(2.2rem, 6vw, 3.6rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.02em; margin-bottom: 14px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; }

.main-panel {
  max-width: 480px; margin: -56px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

.auth-card {
  background: white; border-radius: 24px; padding: 36px 32px;
  box-shadow: 0 24px 60px rgba(10,15,30,.16);
  border: 1px solid rgba(37,99,235,.1);
}
.card-title {
  font-size: 1.3rem; font-weight: 800; color: #0f172a;
  margin-bottom: 24px; text-align: center;
}

.field { margin-bottom: 18px; }
.field-label {
  display: block; font-size: .78rem; font-weight: 700; color: #4f46e5;
  text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px;
}
.field-input {
  width: 100%; padding: 13px 16px; border-radius: 12px;
  border: 1.5px solid #e0e7ff; font-size: .92rem; color: #0f172a;
  background: #f8faff; transition: all .2s; box-sizing: border-box;
}
.field-input:focus {
  outline: none; border-color: #2563eb; background: white;
  box-shadow: 0 0 0 4px rgba(37,99,235,.12);
}

.submit-btn {
  width: 100%; padding: 14px; border-radius: 13px;
  font-size: .95rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; cursor: pointer; margin-top: 6px;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: transform .2s, box-shadow .2s;
}
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.submit-btn:hover .btn-shine { left: 130%; }

.error { color: #e11d48; margin-top: 14px; font-weight: 700; text-align: center; font-size: .88rem; }

.register-link {
  margin-top: 22px; padding-top: 18px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: center; align-items: center; gap: 6px; font-size: .85rem;
}
.register-link span { color: #64748b; }
.link-btn { background: none; border: none; color: #2563eb; font-weight: 700; padding: 0; cursor: pointer; }
.link-btn:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .hero { padding: 50px 20px 80px; }
  .main-panel { margin-top: -48px; padding: 0 16px 40px; }
  .auth-card { padding: 28px 22px; }
}
</style>