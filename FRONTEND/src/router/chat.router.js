import AdminChatListView   from "@/views/chat/AdminChatListView.vue";
import AdminChatDetailView from "@/views/chat/AdminChatDetailView.vue";

const adminChatRoutes = [
  {
    path: "/chat",
    name: "chat.list",
    component: AdminChatListView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/chat/:userId",
    name: "chat.detail",
    component: AdminChatDetailView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

export default adminChatRoutes;