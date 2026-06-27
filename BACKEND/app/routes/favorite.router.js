const express = require("express");
const favorites = require("../controllers/favorite.controller");

const router = express.Router();

router.route("/")
  .post(favorites.add);

router.route("/user/:userId")
  .get(favorites.findByUser)
  .delete(favorites.removeAllByUser);

router.route("/user/:userId/:productId")
  .delete(favorites.remove);

router.route("/check/:userId/:productId")
  .get(favorites.check);

router.route("/count/:productId")
  .get(favorites.countByProduct);

module.exports = router;