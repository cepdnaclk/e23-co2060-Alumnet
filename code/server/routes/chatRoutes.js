const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getMyConversations,
  getChatContacts,
  getConversationMessages,
  sendMessage,
} = require("../controllers/chatController");

// NEW: Get all connected mentors/mentees
router.get(
  "/contacts",
  protect,
  getChatContacts
);

// Existing routes
router.get(
  "/conversations",
  protect,
  getMyConversations
);

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