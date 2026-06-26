const express = require("express");
const router = express.Router();
const  { getMyNotifications, markAsRead } = require("../controllers/notificationController");

// Import your auth middleware (Make this matches how you export it in authMiddleware.js)
const { protect } = require("../middleware/authMiddleware");

// Apply the middleware to all routes in this file
router.use(protect);

// GET: /api/notifications
router.get("/", getMyNotifications);

// PATCH: /api/notifications/:id/read
router.patch("/:id/read", markAsRead);

module.exports = router;