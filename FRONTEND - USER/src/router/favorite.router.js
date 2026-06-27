export default [
  {
    path: "/favorites",
    name: "favorite.list",
    component: () => import("@/views/favorite/Favorite.vue"),
    meta: { requiresAuth: true },
  },
];