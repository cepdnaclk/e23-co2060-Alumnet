const express = require("express");
const {
  getAlumniDirectory,
  getPublicAlumniProfile,
} = require("../controllers/directoryController");

const router = express.Router();

router.get("/", getAlumniDirectory);
router.get("/:id", getPublicAlumniProfile);

module.exports = router;
