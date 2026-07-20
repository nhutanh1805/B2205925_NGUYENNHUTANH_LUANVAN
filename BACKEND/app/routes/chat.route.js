const express = require("express");
const chat = require("../controllers/chat.controller");

const router = express.Router();

// ─── KHÁCH HÀNG ─────────────────────────────────────────────
router.post("/messages",      chat.getMyMessages);   // Lấy tin nhắn của mình
router.post("/send",          chat.sendMessage);      // Gửi tin nhắn

// ─── ADMIN ──────────────────────────────────────────────────
router.get("/admin/conversations",        chat.getConversations);     // Danh sách hội thoại
router.get("/admin/:userId/messages",     chat.getMessagesByUser);    // Xem tin nhắn 1 khách
router.post("/admin/:userId/messages",    chat.adminSendMessage);     // Admin gửi tin

module.exports = router;