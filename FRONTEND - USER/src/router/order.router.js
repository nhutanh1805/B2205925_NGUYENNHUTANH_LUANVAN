import OrderListView from "@/views/order/OrderListView.vue";
import CheckoutView from "@/views/order/CheckoutView.vue";

export default [
  {
    path: "/orders",
    name: "order.list",
    component: OrderListView,
  },
  {
    path: "/checkout",
    name: "order.checkout",
    component: CheckoutView,
  },

  {
  path: "/orders/:orderId",
  name: "order.detail",
  component: () => import("@/views/order/OrderDetailView.vue"),
},
];