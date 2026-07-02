const express = require("express");
const {
  signup,
  login,
  verifyEmail,
  getProfile,
  updateProfile,
  getPendingUsers,
  verifyUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.get("/admin/pending", protect, getPendingUsers);
router.patch("/admin/verify/:userId", protect, verifyUser);

module.exports = router;
