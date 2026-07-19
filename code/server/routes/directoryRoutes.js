const express = require("express");
const {
  getAlumniDirectory,
  getRecommendedAlumni,
  getPublicAlumniProfile,
} = require("../controllers/directoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAlumniDirectory);
router.get("/recommended", protect, authorize("student"), getRecommendedAlumni);
router.get("/:id", getPublicAlumniProfile);

module.exports = router;
