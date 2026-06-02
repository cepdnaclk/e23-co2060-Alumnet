const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getMyConversations,
  getConversationMessages,
  sendMessage,
} = require("../controllers/chatController");


router.get("/conversations", protect, getMyConversations);

router.get(
  "/conversations/:id/messages",
  protect,
  getConversationMessages
);

router.post(
  "/conversations/:id/messages",
  protect,
  sendMessage
);

module.exports = router;