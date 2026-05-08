const express = require("express");
const userAuth = require("../controllers/userAuth.controller");

const router = express.Router();

router.post("/register", userAuth.register);
router.post("/login", userAuth.login);
router.get("/", userAuth.findAll);
router.put("/profile/:id", userAuth.updateProfile);
router.delete("/:id", userAuth.delete);
router.patch("/deactivate/:id", userAuth.deactivate);   // Vô hiệu hóa vĩnh viễn
router.patch("/ban/:id", userAuth.ban);                  // Cấm tài khoản
router.patch("/unban/:id", userAuth.unban);              // Bỏ cấm tài khoản

module.exports = router;