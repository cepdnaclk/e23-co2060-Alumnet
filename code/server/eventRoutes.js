// This file creates an Express Router that exposes
// the API endpoints for our events table

const express = require("express");
const router = express.Router();

// Import shared DB connection
const pool = require("./config/db");

// CREATE EVENT
router.post("/", async (req, res) => {
  try {
    const { title, description, event_date, location } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, description, event_date, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, event_date, location]
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
    const result = await pool.query(
      `SELECT * FROM events ORDER BY event_date ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

module.exports = router;