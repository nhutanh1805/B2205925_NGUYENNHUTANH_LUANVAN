
const express = require("express");
const userAuth = require("../controllers/userAuth.controller");

const router = express.Router();

router.post("/register", userAuth.register);
router.post("/login", userAuth.login);
router.get("/", userAuth.findAll);
router.delete("/:id", userAuth.delete);

module.exports = router;
