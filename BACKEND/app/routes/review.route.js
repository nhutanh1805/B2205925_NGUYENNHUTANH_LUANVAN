const express = require("express");
const reviews = require("../controllers/review.controller");

const router = express.Router({ mergeParams: true });

router.route("/")
  .get(reviews.findByProduct)
  .post(reviews.create);

router.route("/rating-summary")
  .get(reviews.getRatingSummary);

router.route("/:reviewId")
  .put(reviews.update)
  .delete(reviews.delete);

router.route("/:reviewId/helpful")
  .post(reviews.toggleHelpful);

module.exports = router;