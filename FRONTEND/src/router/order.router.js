import OrderListView from "@/views/order/OrderListView.vue";

export default [
  {
    path: "/orders",
    name: "order.list",
    component: OrderListView,
  },

  {
  path: "/orders/:orderId",
  name: "order.detail",
  component: () => import("@/views/order/OrderDetailView.vue"),
},
];