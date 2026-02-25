// This file creates an Express Router that exposes
// the API endpoints for our events table
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Use same DB connection as server.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// CREATE EVENT
router.post('/', async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, description, date, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, date, location]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// GET ALL EVENTS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events ORDER BY date ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;