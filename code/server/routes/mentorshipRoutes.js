const express = require("express");

const {
  createMentorshipRequest,
  requestEndMentorship,
  acceptEndMentorship,
  getStudentRequests,
  getMentorRequests,
  getStudentProfileForMentor,
  updateRequestStatus,
  getMyMentors,
  getMyMentees,
} = require("../controllers/mentorshipController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createMentorshipRequest);
router.post("/end-request", protect, requestEndMentorship);
router.get("/student", protect, getStudentRequests);
router.get("/mentor", protect, getMentorRequests);
router.get("/students/:id/profile", protect, getStudentProfileForMentor);
router.patch("/:id", protect, updateRequestStatus);
router.patch("/:id/end", protect, acceptEndMentorship);
router.get("/my-mentors", protect, getMyMentors);
router.get("/my-mentees", protect, getMyMentees);

module.exports = router;
