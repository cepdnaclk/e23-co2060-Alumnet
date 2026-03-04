const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

/* ----------------------- helpers / validation ----------------------- */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function isValidUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function tooLong(value, max) {
  return value && String(value).length > max;
}

function bad(res, message) {
  return res.status(400).json({ message });
}

/* ----------------------------- REGISTER ----------------------------- */
/**
 * POST /api/auth/register
 * Allowed roles: student, alumni (admin is manual)
 * Minimal fields saved now:
 *  - student: batch, interests
 *  - alumni: company, job_title, grad_year, linkedin_url, interests
 */
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      full_name,

      // student
      batch,
      interests,

      // alumni
      company,
      job_title,
      grad_year,
      linkedin_url,
    } = req.body;

    // Required
    if (!email || !password || !role || !full_name) {
      return bad(res, "email, password, role, full_name are required");
    }

    const cleanRole = String(role).toLowerCase().trim();
    if (!["student", "alumni"].includes(cleanRole)) {
      return bad(res, "role must be 'student' or 'alumni'");
    }

    if (!emailRegex.test(email)) return bad(res, "Invalid email format");
    if (String(password).length < 6) return bad(res, "Password must be at least 6 characters");
    if (tooLong(full_name, 100)) return bad(res, "full_name too long (max 100)");

    // Limits
    if (tooLong(batch, 50)) return bad(res, "batch too long (max 50)");
    if (tooLong(interests, 500)) return bad(res, "interests too long (max 500)");
    if (tooLong(company, 100)) return bad(res, "company too long (max 100)");
    if (tooLong(job_title, 100)) return bad(res, "job_title too long (max 100)");
    if (tooLong(grad_year, 10)) return bad(res, "grad_year too long (max 10)");

    // URL format check (only for alumni at the moment)
    if (!isValidUrl(linkedin_url)) {
      return bad(res, "linkedin_url must start with http/https");
    }

    // Role-based requirements (minimal)
    if (cleanRole === "student") {
      if (!batch || !interests) return bad(res, "Student requires: batch, interests");
    }
    if (cleanRole === "alumni") {
      if (!company || !job_title || !grad_year || !linkedin_url || !interests) {
        return bad(res, "Alumni requires: company, job_title, grad_year, linkedin_url, interests");
      }
      const yr = parseInt(String(grad_year), 10);
      const now = new Date().getFullYear();
      if (!Number.isFinite(yr) || yr < 1980 || yr > now) {
        return bad(res, `grad_year must be between 1980 and ${now}`);
      }
    }

    // Duplicate email
    const existingUser = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) return bad(res, "User already exists");

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role",
      [email, hashedPassword, cleanRole]
    );
    const userId = newUser.rows[0].id;

    // Create profile (verification_status defaults to pending in DB)
    const prof = await pool.query(
      `
      INSERT INTO profiles (
        user_id, full_name,
        batch, interests,
        company, job_title, grad_year, linkedin_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING user_id, full_name, batch, interests, company, job_title, grad_year, linkedin_url, verification_status
      `,
      [
        userId,
        full_name,
        cleanRole === "student" ? batch : null,
        interests || null,
        cleanRole === "alumni" ? company : null,
        cleanRole === "alumni" ? job_title : null,
        cleanRole === "alumni" ? grad_year : null,
        cleanRole === "alumni" ? linkedin_url : null,
      ]
    );

    // Token
    const token = jwt.sign({ id: userId, role: cleanRole }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      profile: {
        id: userId,
        email,
        role: cleanRole,
        ...prof.rows[0],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------ LOGIN ------------------------------ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return bad(res, "All fields required");

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return bad(res, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!ok) return bad(res, "Invalid credentials");

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------------------- PROFILE ----------------------------- */
router.get("/profile", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u.id, u.email, u.role,
        p.full_name, p.bio, p.company, p.job_title, p.skills,
        p.verification_status, p.batch, p.interests, p.grad_year, p.linkedin_url
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------- UPDATE PROFILE ------------------------- */
/**
 * PUT /api/auth/profile
 * Used later by UI (Edit Profile)
 * Allows updating profile fields safely.
 */
router.put("/profile", protect, async (req, res) => {
  try {
    const {
      full_name,
      bio,
      batch,
      interests,
      company,
      job_title,
      grad_year,
      linkedin_url,
    } = req.body;

    if (full_name && tooLong(full_name, 100)) return bad(res, "full_name too long (max 100)");
    if (batch && tooLong(batch, 50)) return bad(res, "batch too long (max 50)");
    if (interests && tooLong(interests, 500)) return bad(res, "interests too long (max 500)");
    if (company && tooLong(company, 100)) return bad(res, "company too long (max 100)");
    if (job_title && tooLong(job_title, 100)) return bad(res, "job_title too long (max 100)");
    if (grad_year && tooLong(grad_year, 10)) return bad(res, "grad_year too long (max 10)");
    if (linkedin_url && !isValidUrl(linkedin_url)) return bad(res, "linkedin_url must start with http/https");

    const updated = await pool.query(
      `
      UPDATE profiles
      SET
        full_name = COALESCE($1, full_name),
        bio = COALESCE($2, bio),
        batch = COALESCE($3, batch),
        interests = COALESCE($4, interests),
        company = COALESCE($5, company),
        job_title = COALESCE($6, job_title),
        grad_year = COALESCE($7, grad_year),
        linkedin_url = COALESCE($8, linkedin_url)
      WHERE user_id = $9
      RETURNING *
      `,
      [full_name ?? null, bio ?? null, batch ?? null, interests ?? null, company ?? null, job_title ?? null, grad_year ?? null, linkedin_url ?? null, req.user.id]
    );

    if (updated.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------------------- ADMIN ----------------------------- */
router.get("/admin/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT u.id, u.email, u.role, p.full_name, p.verification_status
      FROM users u
      JOIN profiles p ON p.user_id = u.id
      WHERE p.verification_status = 'pending'
      ORDER BY u.created_at DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/admin/verify/:userId", protect, authorize("admin"), async (req, res) => {
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

    if (result.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    res.json({ message: "User verified", profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;