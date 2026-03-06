// This file creates an Express Router that exposes
// the API endpoints for our events table

const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const pool = require("../config/db");

// CREATE EVENT (Only admin + alumni)
router.post("/", protect, authorize("admin", "alumni"), async (req, res) => {
  try {
    const { title, description, location, event_date } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, description, location, event_date, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, location, event_date, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM events ORDER BY event_date ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

module.exports = router;