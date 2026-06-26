const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool  = require("../config/db");

const signup = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      full_name,
      email,
      password,
      role,
      department,

      // student
      batch,
      areas_of_interest,
      bio,
      motivation,
      goal,
      linkedin_url,
      github_url,
      portfolio_url,
      cv_url,

      // alumni
      job_title,
      organization,
      graduation_year,
      primary_interests,
      preferred_mentee_capacity,
    } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        message: "full_name, email, password, and role are required",
      });
    }

    const allowedRoles = [
      "student",
      "alumni",
      "system_admin",
      "university_admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role, verification_status, created_at, verified_at, avatar_url
      `,
      [full_name, email, password_hash, role]
    );

    const user = userResult.rows[0];

    if (role === "student") {
      await client.query(
        `
        INSERT INTO student_profiles (
          user_id,
          department,
          batch,
          areas_of_interest,
          bio,
          motivation,
          goal,
          linkedin_url,
          github_url,
          portfolio_url,
          cv_url
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `,
        [
          user.id,
          department || null,
          batch || null,
          areas_of_interest || null,
          bio || null,
          motivation || null,
          goal || null,
          linkedin_url || null,
          github_url || null,
          portfolio_url || null,
          cv_url || null,
        ]
      );
    }

    if (role === "alumni") {
      await client.query(
        `
        INSERT INTO alumni_profiles (
          user_id,
          department,
          job_title,
          organization,
          graduation_year,
          linkedin_url,
          primary_interests,
          preferred_mentee_capacity,
          bio
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `,
        [
          user.id,
          department || null,
          job_title || null,
          organization || null,
          graduation_year || null,
          linkedin_url || null,
          primary_interests || null,
          preferred_mentee_capacity || 1,
          bio || null,
        ]
      );
    }

    await client.query("COMMIT");

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        verification_status,
        created_at,
        verified_at,
        avatar_url
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        verification_status: user.verification_status,
        created_at: user.created_at,
        verified_at: user.verified_at,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        role,
        verification_status,
        created_at,
        verified_at,
        avatar_url
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    let profile = {};

    if (user.role === "student") {
      const studentResult = await pool.query(
        `
        SELECT
          department,
          batch,
          areas_of_interest,
          bio,
          motivation,
          goal,
          linkedin_url,
          github_url,
          portfolio_url,
          cv_url
        FROM student_profiles
        WHERE user_id = $1
        `,
        [userId]
      );

      profile = studentResult.rows[0] || {};
    }

    if (user.role === "alumni") {
      const alumniResult = await pool.query(
        `
        SELECT
          department,
          graduation_year,
          job_title,
          organization,
          linkedin_url,
          primary_interests,
          preferred_mentee_capacity,
          bio
        FROM alumni_profiles
        WHERE user_id = $1
        `,
        [userId]
      );

      profile = alumniResult.rows[0] || {};
    }

    return res.status(200).json({
      ...user,
      ...profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    if (
      req.user.role !== "university_admin" &&
      req.user.role !== "system_admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await pool.query(`
      SELECT
        id,
        full_name,
        email,
        role,
        verification_status,
        created_at,
        avatar_url
      FROM users
      WHERE verification_status = 'pending'
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

const verifyUser = async (req, res) => {
  try {
    if (
      req.user.role !== "university_admin" &&
      req.user.role !== "system_admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { userId } = req.params;

    const result = await pool.query(
      `
      UPDATE users
      SET verification_status='verified',
          verified_at=CURRENT_TIMESTAMP
      WHERE id=$1
      RETURNING id, full_name, email, role, verification_status, avatar_url
      `,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify user" });
  }
};

const updateProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const role = req.user.role;

    const {
      full_name,
      avatar_url,
      department,

      // student
      batch,
      bio,
      interests,
      motivation,
      goal,
      linkedin_url,
      github_url,
      portfolio_url,
      cv_url,

      // alumni
      graduation_year,
      job_title,
      organization,
      preferred_mentee_capacity,
    } = req.body;

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE users
      SET
        full_name = $1,
        avatar_url = $2
      WHERE id = $3
      `,
      [full_name || null, avatar_url || null, userId]
    );

    if (role === "student") {
      await client.query(
        `
        UPDATE student_profiles
        SET
          department = $1,
          batch = $2,
          areas_of_interest = $3,
          bio = $4,
          motivation = $5,
          goal = $6,
          linkedin_url = $7,
          github_url = $8,
          portfolio_url = $9,
          cv_url = $10
        WHERE user_id = $11
        `,
        [
          department || null,
          batch || null,
          interests || null,
          bio || null,
          motivation || null,
          goal || null,
          linkedin_url || null,
          github_url || null,
          portfolio_url || null,
          cv_url || null,
          userId,
        ]
      );
    }

    if (role === "alumni") {
      await client.query(
        `
        UPDATE alumni_profiles
        SET
          department = $1,
          graduation_year = $2,
          job_title = $3,
          organization = $4,
          primary_interests = $5,
          preferred_mentee_capacity = $6,
          bio = $7,
          linkedin_url = $8
        WHERE user_id = $9
        `,
        [
          department || null,
          graduation_year || null,
          job_title || null,
          organization || null,
          interests || null,
          preferred_mentee_capacity || null,
          bio || null,
          linkedin_url || null,
          userId,
        ]
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Profile update failed" });
  } finally {
    client.release();
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  getPendingUsers,
  verifyUser,
};