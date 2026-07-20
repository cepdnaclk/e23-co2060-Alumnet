const express = require("express");
const {
  signup,
  login,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  updateProfile,
  getPendingUsers,
  verifyUser,
  heartbeat,
  getEmailPreferences,
  updateEmailPreferences,
} = require("../controllers/authController");
const {
  getStats: getAdminStats,
  getPendingUsers: getAdminPendingUsers,
  verifyUserStatus,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/resend-verification-email", resendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/heartbeat", protect, heartbeat);
router.get("/email-preferences", protect, getEmailPreferences);
router.put("/email-preferences", protect, updateEmailPreferences);

router.get("/admin/pending", protect, getPendingUsers);
router.patch("/admin/verify/:userId", protect, verifyUser);
router.get("/admin/stats", protect, getAdminStats);
router.get("/admin/pending-users", protect, getAdminPendingUsers);
router.put("/admin/verify-user/:id", protect, verifyUserStatus);

module.exports = router;
