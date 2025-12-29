import UserLogin from "@/views/user/UserLogin.vue";
import UserRegister from "@/views/user/UserRegister.vue";
import UserDashboard from "@/views/user/UserDashboard.vue";

export default [
  {
    path: "/user/login",
    name: "user.login",
    component: UserLogin,
  },
  {
    path: "/user/register",
    name: "user.register",
    component: UserRegister,
  },
  {
    path: "/user",
    name: "user.dashboard",
    component: UserDashboard,
  },
];
