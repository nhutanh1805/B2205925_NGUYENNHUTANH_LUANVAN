<template>
  <header class="header">
    <div class="header-inner">

      <!-- LOGO -->
      <div class="logo" @click="$router.push('/')">
        <div class="logo-badge">
          
        </div>
        <span class="logo-text">NHUTANHSTORE</span>
      </div>

      <!-- NAV -->
      <nav class="nav">
        <router-link to="/" class="nav-link" active-class="nav-active">
          Trang chủ
        </router-link>

        <router-link to="/products" class="nav-link" active-class="nav-active">
          Sản phẩm
        </router-link>

        <router-link
          to="/cart"
          class="nav-link cart-link"
          active-class="cart-active"
        >
          Giỏ hàng
        </router-link>
      </nav>

    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
/* ================= HEADER ================= */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(18px);
  background:
    linear-gradient(135deg, rgba(59,130,246,.85), rgba(99,102,241,.85)),
    radial-gradient(circle at top left, rgba(255,255,255,.25), transparent 60%);
  box-shadow:
    0 20px 40px rgba(0,0,0,.35),
    inset 0 1px 0 rgba(255,255,255,.2);
}

.header-inner {
  max-width: 1320px;
  margin: auto;
  padding: 0 24px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ================= LOGO ================= */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-badge {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  font-size: 1.3rem;
  background: rgba(255,255,255,.25);
  box-shadow:
    0 8px 20px rgba(0,0,0,.35),
    inset 0 1px 0 rgba(255,255,255,.4);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: .6px;
  color: white;
  text-shadow: 0 4px 12px rgba(0,0,0,.4);
}

/* ================= NAV ================= */
.nav {
  display: flex;
  gap: 30px;
}

/* link base */
.nav-link {
  position: relative;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  color: rgba(255,255,255,.85);
  transition: all .25s ease;
}

/* hover float */
.nav-link:hover {
  color: white;
  background: rgba(255,255,255,.12);
  box-shadow:
    0 8px 20px rgba(0,0,0,.25),
    inset 0 1px 0 rgba(255,255,255,.3);
}

/* active glow */
.nav-active {
  color: white;
  background: rgba(255,255,255,.22);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.35),
    0 10px 30px rgba(0,0,0,.35);
}

/* ================= CART ================= */
.cart-link {
  padding: 8px 18px;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,.25),
    rgba(255,255,255,.15)
  );
  box-shadow:
    0 8px 24px rgba(0,0,0,.35),
    inset 0 1px 0 rgba(255,255,255,.4);
}

.cart-link:hover {
  transform: translateY(-1px);
}

/* cart active */
.cart-active {
  background: linear-gradient(135deg, #ffffff, #e0e7ff);
  color: #1e3a8a;
}
</style>
