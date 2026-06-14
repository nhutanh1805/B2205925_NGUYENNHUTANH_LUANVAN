import AdminSupportListView   from "@/views/support/AdminSupportListView.vue";
import AdminSupportDetailView from "@/views/support/AdminSupportDetailView.vue";

const adminSupportRoutes = [
  {
    path: "/support",
    name: "support.list",
    component: AdminSupportListView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/support/:id",
    name: "support.detail",
    component: AdminSupportDetailView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

export default adminSupportRoutes;