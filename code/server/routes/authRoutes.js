const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * REGISTER
 * Creates user + creates profile with verification_status defaulting to 'pending'
 */
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      full_name,

      // optional role fields (we just store if provided)
      batch,
      interests,
      grad_year,
      linkedin_url,
      company,
      job_title,
      skills,
      bio,
    } = req.body;

    if (!email || !password || !role || !full_name) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role",
      [email, hashedPassword, role]
    );

    const userId = newUser.rows[0].id;

    // Insert into profiles (verification_status defaults to 'pending' in DB)
    // Store optional fields if present; irrelevant fields can be null.
    const profileRes = await pool.query(
      `INSERT INTO profiles (
        user_id, full_name, bio, company, job_title, skills,
        batch, interests, grad_year, linkedin_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING user_id, full_name, bio, company, job_title, skills,
                batch, interests, grad_year, linkedin_url, verification_status`,
      [
        userId,
        full_name,
        bio || null,
        company || null,
        job_title || null,
        skills || null,
        batch || null,
        interests || null,
        grad_year || null,
        linkedin_url || null,
      ]
    );

    // Create token
    const token = jwt.sign(
      { id: userId, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      profile: {
        id: userId,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
        ...profileRes.rows[0],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN
 * Returns JWT token
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PROFILE (protected)
 * Returns user + profile including verification_status
 */
router.get("/profile", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.role,
        p.full_name,
        p.bio,
        p.company,
        p.job_title,
        p.skills,
        p.verification_status,
        p.batch,
        p.interests,
        p.grad_year,
        p.linkedin_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ADMIN-ONLY (test route)
 */
router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

/**
 * ADMIN: list pending users
 */
router.get("/admin/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.role,
        p.full_name,
        p.verification_status
      FROM users u
      JOIN profiles p ON p.user_id = u.id
      WHERE p.verification_status = 'pending'
      ORDER BY p.full_name ASC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ADMIN: verify a user
 */
router.patch(
  "/admin/verify/:userId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        `
        UPDATE profiles
        SET verification_status = 'verified'
        WHERE user_id = $1
        RETURNING user_id, verification_status
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json({ message: "User verified", profile: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;