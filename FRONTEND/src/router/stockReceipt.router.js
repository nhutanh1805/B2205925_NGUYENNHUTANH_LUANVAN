import StockReceiptList   from "@/views/stock/StockReceiptList.vue";
import StockReceiptCreate from "@/views/stock/StockReceiptCreate.vue";
import StockReceiptDetail from "@/views/stock/StockReceiptDetail.vue";

export default [
  {
    path: "/admin/stock-receipts",
    name: "admin.stockReceipt.list",
    component: StockReceiptList,
  },
  {
    path: "/admin/stock-receipts/create",
    name: "admin.stockReceipt.create",
    component: StockReceiptCreate,
  },
  {
    path: "/admin/stock-receipts/:id",
    name: "admin.stockReceipt.detail",
    component: StockReceiptDetail,
  },
];