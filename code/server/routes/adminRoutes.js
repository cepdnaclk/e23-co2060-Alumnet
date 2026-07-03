const express = require("express");
const { getStats, getPendingUsers, verifyUserStatus } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes here require the user to be logged in and possess an admin role
router.use(protect);
router.use(authorize("university_admin", "system_admin"));

router.get("/stats", getStats);
router.get("/pending-users", getPendingUsers);
router.put("/verify-user/:id", verifyUserStatus);

module.exports = router;
