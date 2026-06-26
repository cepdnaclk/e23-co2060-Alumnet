const  pool  = require("../config/db");

const getAlumniDirectory = async (req, res) => {
  try {
    const { search = "", department = "" } = req.query;

    const values = [];
    const whereParts = [`u.role = 'alumni'`];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      const i = values.length;

      whereParts.push(`
        (
          u.full_name ILIKE $${i}
          OR ap.job_title ILIKE $${i}
          OR ap.organization ILIKE $${i}
          OR ap.primary_interests ILIKE $${i}
        )
      `);
    }

    if (department.trim()) {
      values.push(department.trim());
      const i = values.length;
      whereParts.push(`LOWER(TRIM(ap.department)) = LOWER(TRIM($${i}))`);
    }

    const query = `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.avatar_url,
        u.verification_status,
        ap.department,
        ap.job_title,
        ap.organization,
        ap.graduation_year,
        ap.linkedin_url,
        ap.primary_interests,
        ap.preferred_mentee_capacity,
        ap.bio,
        (
          SELECT COUNT(*)::int
          FROM mentorship_requests mr
          WHERE mr.alumni_user_id = u.id AND mr.status = 'accepted'
        ) AS accepted_mentees_count
      FROM users u
      INNER JOIN alumni_profiles ap ON ap.user_id = u.id
      WHERE ${whereParts.join(" AND ")}
      ORDER BY u.full_name ASC
    `;

    const result = await pool.query(query, values);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Directory fetch error:", error);
    return res.status(500).json({ message: "Failed to load alumni directory" });
  }
};

const getPublicAlumniProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.avatar_url,
        u.verification_status,
        ap.department,
        ap.job_title,
        ap.organization,
        ap.graduation_year,
        ap.linkedin_url,
        ap.primary_interests,
        ap.preferred_mentee_capacity,
        ap.bio,
        (
          SELECT COUNT(*)::int
          FROM mentorship_requests mr
          WHERE mr.alumni_user_id = u.id AND mr.status = 'accepted'
        ) AS accepted_mentees_count
      FROM users u
      INNER JOIN alumni_profiles ap ON ap.user_id = u.id
      WHERE u.id = $1 AND u.role = 'alumni'
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Alumni profile not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Public alumni profile fetch error:", error);
    return res.status(500).json({ message: "Failed to load alumni profile" });
  }
};

module.exports = { getAlumniDirectory, getPublicAlumniProfile };