import SupportListView   from "@/views/support/SupportListView.vue";
import SupportCreateView from "@/views/support/SupportCreateView.vue";
import SupportDetailView from "@/views/support/SupportDetailView.vue";

const supportRoutes = [
  {
    path: "/support",
    name: "SupportList",
    component: SupportListView,
    meta: { requiresAuth: true },
  },
  {
    path: "/support/create",
    name: "SupportCreate",
    component: SupportCreateView,
    meta: { requiresAuth: true },
  },
  {
    path: "/support/:id",
    name: "SupportDetail",
    component: SupportDetailView,
    meta: { requiresAuth: true },
  },
];

export default supportRoutes;