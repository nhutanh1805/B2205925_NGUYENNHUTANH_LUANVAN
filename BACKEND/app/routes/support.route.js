const express = require("express");
const support = require("../controllers/support.controller");

const router = express.Router();

// ─── KHÁCH HÀNG ─────────────────────────────────────────────────────────────
router.post("/",                  support.createRequest);       // Tạo yêu cầu
router.post("/eligible-orders",   support.getEligibleOrders);    // Đơn hàng đủ điều kiện đổi trả/bảo hành
router.post("/my",                support.getMyRequests);        // Danh sách của tôi
router.post("/:id/detail",        support.getRequestDetail);     // Chi tiết + tin nhắn
router.post("/:id/messages",      support.sendMessage);          // Khách gửi tin

// ─── ADMIN ───────────────────────────────────────────────────────────────────
router.get("/admin",                  support.getAllRequests);   // Lấy tất cả
router.patch("/admin/:id/status",     support.updateStatus);    // Cập nhật trạng thái
router.get("/admin/:id/messages",     support.getMessages);     // Lấy tin nhắn
router.post("/admin/:id/messages",    support.adminSendMessage); // Admin gửi tin

module.exports = router;