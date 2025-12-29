const express = require("express");
const adminAuth = require("../controllers/adminAuth.controller");

const router = express.Router();

router.post("/register", adminAuth.register);
router.post("/login", adminAuth.login);
router.get("/", adminAuth.findAll);
router.delete("/:id", adminAuth.delete);

module.exports = router;
