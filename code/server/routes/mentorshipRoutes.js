const express = require("express");

const {
  createMentorshipRequest,
  getStudentRequests,
  getMentorRequests,
  updateRequestStatus,
  getMyMentors,
  getMyMentees,
} = require("../controllers/mentorshipController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createMentorshipRequest);
router.get("/student", protect, getStudentRequests);
router.get("/mentor", protect, getMentorRequests);
router.patch("/:id", protect, updateRequestStatus);
router.get("/my-mentors", protect, getMyMentors);
router.get("/my-mentees", protect, getMyMentees);

module.exports = router;