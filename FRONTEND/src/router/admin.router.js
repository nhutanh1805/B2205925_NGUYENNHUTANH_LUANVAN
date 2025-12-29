import AdminLogin from "@/views/admin/AdminLogin.vue";
import AdminRegister from "@/views/admin/AdminRegister.vue";
import AdminDashboard from "@/views/admin/AdminDashboard.vue";

export default [
  {
    path: "/admin/login",
    name: "admin.login",
    component: AdminLogin,
  },
  {
    path: "/admin/register",
    name: "admin.register",
    component: AdminRegister,
  },
  {
    path: "/admin",
    name: "admin.dashboard",
    component: AdminDashboard,
  },
];
