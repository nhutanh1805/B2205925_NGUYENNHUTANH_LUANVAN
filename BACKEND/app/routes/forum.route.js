const express = require("express");
const forum = require("../controllers/forum.controller");

const router = express.Router();

router.get("/messages",  forum.getMessages);   // Lấy tin nhắn (kèm ?since= để lấy tin mới)
router.post("/messages", forum.createMessage); // Đăng tin nhắn mới

module.exports = router;