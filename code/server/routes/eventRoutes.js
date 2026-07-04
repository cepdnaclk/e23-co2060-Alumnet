const express = require("express");
const {
  createEvent,
  getApprovedEvents,
  getPendingEvents,
  getAdminEvents,
  getEventStats,
  approveEvent,
  rejectEvent,
  registerForEvent,
  getMyRegisteredEvents,
  getEventById,
  getMyCreatedEvents,
  updateEvent,
} = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getApprovedEvents);
router.post("/", protect, createEvent);

router.get("/pending", protect, getPendingEvents);
router.get("/admin/all", protect, getAdminEvents);
router.get("/admin/stats", protect, getEventStats);
router.patch("/approve/:id", protect, approveEvent);
router.patch("/reject/:id", protect, rejectEvent);

router.post("/:eventId/register", protect, registerForEvent);
router.get("/my-registrations", protect, getMyRegisteredEvents);
router.get("/my-created", protect, getMyCreatedEvents);
router.get("/:id", protect, getEventById);
router.put("/:id", protect, updateEvent);

module.exports = router;
