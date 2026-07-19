const pool = require("../config/db");

function splitTerms(value = "") {
  return String(value || "")
    .toLowerCase()
    .split(/[,|;/\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function tokenise(value = "") {
  return new Set(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9+#.\- ]/g, " ")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 2)
  );
}

function countSharedTerms(left = "", right = "") {
  const leftTerms = splitTerms(left);
  const rightTerms = splitTerms(right);
  const rightTokens = tokenise(right);

  return leftTerms.filter((term) => {
    if (rightTerms.includes(term)) return true;
    const words = [...tokenise(term)];
    return words.length > 0 && words.some((word) => rightTokens.has(word));
  }).length;
}

function calculateRecommendation(student, alumni) {
  let score = 0;
  const reasons = [];

  const studentDepartment = String(student.department || "").trim().toLowerCase();
  const alumniDepartment = String(alumni.department || "").trim().toLowerCase();

  if (studentDepartment && alumniDepartment && studentDepartment === alumniDepartment) {
    score += 45;
    reasons.push("Same department");
  }

  const interestMatches = countSharedTerms(
    student.areas_of_interest,
    `${alumni.primary_interests || ""}, ${alumni.job_title || ""}`
  );

  if (interestMatches > 0) {
    score += Math.min(interestMatches * 15, 30);
    reasons.push(
      interestMatches === 1 ? "Shared interest" : `${interestMatches} shared interests`
    );
  }

  const goalMatches = countSharedTerms(
    student.goal,
    `${alumni.job_title || ""}, ${alumni.organization || ""}, ${alumni.primary_interests || ""}, ${alumni.bio || ""}`
  );

  if (goalMatches > 0) {
    score += Math.min(goalMatches * 15, 30);
    reasons.push("Career goal match");
  }

  const capacity = Number(alumni.preferred_mentee_capacity || 0);
  const accepted = Number(alumni.accepted_mentees_count || 0);
  if (capacity > accepted) {
    score += 10;
    reasons.push("Available for mentoring");
  }

  return {
    ...alumni,
    recommendation_score: Math.min(score, 100),
    recommendation_reasons: reasons,
  };
}

const baseAlumniSelect = `
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
      WHERE mr.alumni_user_id = u.id
        AND mr.status IN ('accepted', 'ending_requested')
    ) AS accepted_mentees_count
  FROM users u
  INNER JOIN alumni_profiles ap ON ap.user_id = u.id
`;

const getAlumniDirectory = async (req, res) => {
  try {
    const { search = "", department = "" } = req.query;
    const values = [];
    const whereParts = [`u.role = 'alumni'`, `COALESCE(ap.is_public, TRUE) = TRUE`];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      const i = values.length;
      whereParts.push(`
        (
          u.full_name ILIKE $${i}
          OR ap.job_title ILIKE $${i}
          OR ap.organization ILIKE $${i}
          OR ap.primary_interests ILIKE $${i}
          OR ap.bio ILIKE $${i}
        )
      `);
    }

    if (department.trim()) {
      values.push(department.trim());
      const i = values.length;
      whereParts.push(`LOWER(TRIM(ap.department)) = LOWER(TRIM($${i}))`);
    }

    const result = await pool.query(
      `${baseAlumniSelect}
       WHERE ${whereParts.join(" AND ")}
       ORDER BY u.full_name ASC`,
      values
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Directory fetch error:", error);
    return res.status(500).json({ message: "Failed to load alumni directory" });
  }
};

const getRecommendedAlumni = async (req, res) => {
  try {
    const studentUserId = req.user.id;

    const studentResult = await pool.query(
      `SELECT department, areas_of_interest, goal
       FROM student_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [studentUserId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const alumniResult = await pool.query(
      `${baseAlumniSelect}
       WHERE u.role = 'alumni'
         AND u.verification_status = 'verified'
         AND COALESCE(ap.is_public, TRUE) = TRUE`
    );

    const recommendations = alumniResult.rows
      .map((alumni) => calculateRecommendation(studentResult.rows[0], alumni))
      .filter((alumni) => alumni.recommendation_score > 0)
      .sort((a, b) => {
        if (b.recommendation_score !== a.recommendation_score) {
          return b.recommendation_score - a.recommendation_score;
        }
        return a.full_name.localeCompare(b.full_name);
      });

    return res.status(200).json(recommendations);
  } catch (error) {
    console.error("Recommendation fetch error:", error);
    return res.status(500).json({ message: "Failed to load recommendations" });
  }
};

const getPublicAlumniProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `${baseAlumniSelect}
       WHERE u.id = $1
         AND u.role = 'alumni'
         AND COALESCE(ap.is_public, TRUE) = TRUE
       LIMIT 1`,
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

module.exports = {
  getAlumniDirectory,
  getRecommendedAlumni,
  getPublicAlumniProfile,
};
