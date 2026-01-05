import { createWebHistory, createRouter } from "vue-router";
import adminRoutes from "./admin.router";
import orderRoutes from "./order.router";

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
    path: "/products/add",
    name: "product.add",
    component: () => import("@/views/product/ProductAdd.vue"),
  },
  {
    path: "/products/:id",
    name: "product.detail",
    component: () => import("@/views/product/ProductDetail.vue"),
    props: true,
  },
  {
    path: "/products/edit/:id",
    name: "product.edit",
    component: () => import("@/views/product/ProductEdit.vue"),
    props: true,
  },

  // ===== ADMIN =====
  ...adminRoutes,

    // ===== order =====
 ...orderRoutes,
 
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
