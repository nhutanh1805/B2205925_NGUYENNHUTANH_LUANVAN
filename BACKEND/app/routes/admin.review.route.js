const express = require("express");
const reviews = require("../controllers/review.controller");

const router = express.Router();

router.get("/", reviews.adminFindAll);
router.get("/stats", reviews.adminGetStats);

router.get("/notifications", reviews.adminGetNotifications);
router.patch("/notifications/read-all", reviews.adminMarkAllNotificationsRead);
router.patch("/notifications/:notificationId/read", reviews.adminMarkNotificationRead);

router.patch("/:reviewId/visibility", reviews.toggleVisibility);
router.post("/:reviewId/reply", reviews.replyToReview);
router.delete("/:reviewId/reply", reviews.deleteReply);
router.delete("/:reviewId", reviews.delete);

module.exports = router;