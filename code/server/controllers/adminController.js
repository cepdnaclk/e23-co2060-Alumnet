const pool = require("../config/db");
const { createNotification } = require("../utils/notify");

const getStats = async (req, res) => {
  try {
    const roleStatsResult = await pool.query(`
      SELECT role, COUNT(*)::int AS count
      FROM users
      GROUP BY role
    `);

    const verificationStatsResult = await pool.query(`
      SELECT verification_status, COUNT(*)::int AS count
      FROM users
      GROUP BY verification_status
    `);

    const roleCounts = {};
    roleStatsResult.rows.forEach((row) => {
      roleCounts[row.role] = row.count;
    });

    const verificationCounts = {};
    verificationStatsResult.rows.forEach((row) => {
      verificationCounts[row.verification_status] = row.count;
    });

    res.json({
      totalAlumni: roleCounts["alumni"] || 0,
      totalStudents: roleCounts["student"] || 0,
      verified: verificationCounts["verified"] || 0,
      rejected: verificationCounts["rejected"] || 0,
      pending: verificationCounts["pending"] || 0,
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ message: "Failed to load dashboard statistics" });
  }
};

const getPendingUsers = async (req, res) => {
  try {
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
    console.error("getPendingUsers error:", error);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

const verifyUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be 'verified' or 'rejected'." });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET verification_status = $1::varchar,
          verified_at = CASE WHEN $1::text = 'verified' THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = $2
      RETURNING id, full_name, email, role, verification_status, avatar_url
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = result.rows[0];

    if (status === "verified") {
      await createNotification(
        id,
        "Account Verified",
        "Your account has been verified by the administrator. Welcome to Alumnet!",
        "ACCOUNT_UPDATE"
      );
    } else {
      await createNotification(
        id,
        "Account Rejected",
        "Your account registration request has been declined by the administrator.",
        "ACCOUNT_UPDATE"
      );
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("verifyUserStatus error:", error);
    res.status(500).json({ message: "Failed to update verification status" });
  }
};

module.exports = {
  getStats,
  getPendingUsers,
  verifyUserStatus,
};
