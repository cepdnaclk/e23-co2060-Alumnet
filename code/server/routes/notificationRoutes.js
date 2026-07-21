const express = require("express");
const router = express.Router();
const { 
    getMyNotifications, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead 
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead); 
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;