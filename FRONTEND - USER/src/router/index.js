import { createWebHistory, createRouter } from "vue-router";
import userRoutes from "./user.router";
import cartRoutes from "./cart.router";
import orderRoutes from "./order.router";
import pointRoutes from "./point.router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
  },

  // ===== PRODUCT =====
  {
    path: "/products",
    name: "product.list",
    component: () => import("@/views/product/ProductList.vue"),
  },

  {
    path: "/products/:id",
    name: "product.detail",
    component: () => import("@/views/product/ProductDetail.vue"),
    props: true,
  },

  // ===== VNPay PAYMENT (THÊM MỚI) =====
  {
    path: "/payment-success",
    name: "payment.success",
    component: () => import("@/views/payment/PaymentSuccess.vue"),
  },
  {
    path: "/payment-failed",
    name: "payment.failed",
    component: () => import("@/views/payment/PaymentFailed.vue"),
  },

  // ===== ADMIN =====
  ...userRoutes,

  // ===== CART =====
  ...cartRoutes,

  // ===== ORDER =====
  ...orderRoutes,

...pointRoutes,

  // ===== NOT FOUND =====
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;