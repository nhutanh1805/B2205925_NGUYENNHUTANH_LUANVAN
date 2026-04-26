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

  // VNPay return (PHẢI MATCH BACKEND)
  {
    path: "/payment/vnpay-return",
    name: "payment.return",
    component: () => import("@/views/payment/PaymentSuccess.vue"),
  },

  {
    path: "/payment-failed",
    name: "payment.failed",
    component: () => import("@/views/payment/PaymentFailed.vue"),
  },
];