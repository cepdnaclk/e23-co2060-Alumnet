const express = require("express");
const {
  createEvent,
  getApprovedEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  registerForEvent,
  getMyRegisteredEvents,
} = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getApprovedEvents);
router.post("/", protect, createEvent);

router.get("/pending", protect, getPendingEvents);
router.patch("/approve/:id", protect, approveEvent);
router.patch("/reject/:id", protect, rejectEvent);

router.post("/:eventId/register", protect, registerForEvent);
router.get("/my-registrations", protect, getMyRegisteredEvents);

module.exports = router;