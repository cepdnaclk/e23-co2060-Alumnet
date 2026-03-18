const { pool } = require("../src/db");

const createMentorshipRequest = async (req, res) => {
  try {
    const studentUserId = req.user.id;
    const studentRole = req.user.role;
    const { alumni_user_id, message } = req.body;

    if (studentRole !== "student") {
      return res.status(403).json({
        message: "Only students can send mentorship requests",
      });
    }

    if (!alumni_user_id) {
      return res.status(400).json({
        message: "alumni_user_id is required",
      });
    }

    if (Number(studentUserId) === Number(alumni_user_id)) {
      return res.status(400).json({
        message: "You cannot send a mentorship request to yourself",
      });
    }

    const alumniResult = await pool.query(
      `
      SELECT
        u.id,
        u.role,
        u.verification_status,
        ap.preferred_mentee_capacity
      FROM users u
      LEFT JOIN alumni_profiles ap ON ap.user_id = u.id
      WHERE u.id = $1
      `,
      [alumni_user_id]
    );

    if (alumniResult.rows.length === 0) {
      return res.status(404).json({
        message: "Alumni user not found",
      });
    }

    const alumni = alumniResult.rows[0];

    if (alumni.role !== "alumni") {
      return res.status(400).json({
        message: "Mentorship requests can only be sent to alumni",
      });
    }

    if (alumni.verification_status !== "verified") {
      return res.status(400).json({
        message: "This mentor is not verified yet",
      });
    }

    const acceptedCountResult = await pool.query(
      `
      SELECT COUNT(*)::int AS accepted_count
      FROM mentorship_requests
      WHERE alumni_user_id = $1 AND status = 'accepted'
      `,
      [alumni_user_id]
    );

    const acceptedCount = acceptedCountResult.rows[0].accepted_count;
    const capacity = alumni.preferred_mentee_capacity ?? 1;

    if (acceptedCount >= capacity) {
      return res.status(400).json({
        message: "This mentor has reached their mentee capacity",
      });
    }

    const existingPendingRequest = await pool.query(
      `
      SELECT id
      FROM mentorship_requests
      WHERE student_user_id = $1 AND alumni_user_id = $2 AND status = 'pending'
      `,
      [studentUserId, alumni_user_id]
    );

    if (existingPendingRequest.rows.length > 0) {
      return res.status(409).json({
        message: "You already have a pending request for this mentor",
      });
    }

    const existingAcceptedRequest = await pool.query(
      `
      SELECT id
      FROM mentorship_requests
      WHERE student_user_id = $1 AND alumni_user_id = $2 AND status = 'accepted'
      `,
      [studentUserId, alumni_user_id]
    );

    if (existingAcceptedRequest.rows.length > 0) {
      return res.status(409).json({
        message: "You are already connected with this mentor",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO mentorship_requests (
        student_user_id,
        alumni_user_id,
        message
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [studentUserId, alumni_user_id, message || null]
    );

    return res.status(201).json({
      message: "Mentorship request sent successfully",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Create mentorship request error:", error);
    return res.status(500).json({
      message: "Failed to send mentorship request",
    });
  }
};

const getStudentRequests = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        mr.id,
        mr.message,
        mr.status,
        mr.created_at,
        u.id AS alumni_user_id,
        u.full_name AS alumni_full_name,
        u.avatar_url AS alumni_avatar_url,
        u.verification_status AS alumni_verification_status,
        ap.department AS alumni_department,
        ap.job_title AS alumni_job_title,
        ap.organization AS alumni_organization,
        ap.linkedin_url AS alumni_linkedin_url,
        ap.primary_interests AS alumni_primary_interests
      FROM mentorship_requests mr
      JOIN users u ON u.id = mr.alumni_user_id
      LEFT JOIN alumni_profiles ap ON ap.user_id = u.id
      WHERE mr.student_user_id = $1
      ORDER BY mr.created_at DESC
      `,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch student requests" });
  }
};

const getMentorRequests = async (req, res) => {
  try {
    const alumniId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        mr.id,
        mr.message,
        mr.status,
        mr.created_at,
        u.id AS student_user_id,
        u.full_name AS student_full_name,
        u.avatar_url AS student_avatar_url,
        u.verification_status AS student_verification_status,
        sp.department AS student_department,
        sp.batch AS student_batch,
        sp.areas_of_interest AS student_areas_of_interest,
        sp.linkedin_url AS student_linkedin_url,
        sp.github_url AS student_github_url
      FROM mentorship_requests mr
      JOIN users u ON u.id = mr.student_user_id
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE mr.alumni_user_id = $1
      ORDER BY mr.created_at DESC
      `,
      [alumniId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch mentor requests" });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const alumniRole = req.user.role;
    const { id } = req.params;
    const { status } = req.body;

    if (alumniRole !== "alumni") {
      return res.status(403).json({
        message: "Only alumni can update mentorship requests",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted or rejected",
      });
    }

    const requestResult = await pool.query(
      `
      SELECT *
      FROM mentorship_requests
      WHERE id = $1
      `,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    const requestRow = requestResult.rows[0];

    if (Number(requestRow.alumni_user_id) !== Number(alumniId)) {
      return res.status(403).json({
        message: "You cannot update this request",
      });
    }

    if (requestRow.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be updated",
      });
    }

    if (status === "accepted") {
      const mentorResult = await pool.query(
        `
        SELECT
          u.verification_status,
          ap.preferred_mentee_capacity
        FROM users u
        LEFT JOIN alumni_profiles ap ON ap.user_id = u.id
        WHERE u.id = $1
        `,
        [alumniId]
      );

      const mentor = mentorResult.rows[0];

      if (!mentor || mentor.verification_status !== "verified") {
        return res.status(400).json({
          message: "Only verified mentors can accept requests",
        });
      }

      const acceptedCountResult = await pool.query(
        `
        SELECT COUNT(*)::int AS accepted_count
        FROM mentorship_requests
        WHERE alumni_user_id = $1 AND status = 'accepted'
        `,
        [alumniId]
      );

      const acceptedCount = acceptedCountResult.rows[0].accepted_count;
      const capacity = mentor.preferred_mentee_capacity ?? 1;

      if (acceptedCount >= capacity) {
        return res.status(400).json({
          message: "You have reached your mentee capacity",
        });
      }
    }

    const result = await pool.query(
      `
      UPDATE mentorship_requests
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update request" });
  }
};

const getMyMentors = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.avatar_url,
        u.verification_status,
        ap.department,
        ap.job_title,
        ap.organization,
        ap.linkedin_url,
        ap.primary_interests
      FROM mentorship_requests mr
      JOIN users u ON u.id = mr.alumni_user_id
      LEFT JOIN alumni_profiles ap ON ap.user_id = u.id
      WHERE mr.student_user_id = $1
      AND mr.status = 'accepted'
      ORDER BY u.full_name ASC
      `,
      [studentId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mentors" });
  }
};

const getMyMentees = async (req, res) => {
  try {
    const alumniId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.avatar_url,
        u.verification_status,
        sp.department,
        sp.batch,
        sp.areas_of_interest,
        sp.linkedin_url,
        sp.github_url
      FROM mentorship_requests mr
      JOIN users u ON u.id = mr.student_user_id
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE mr.alumni_user_id = $1
      AND mr.status = 'accepted'
      ORDER BY u.full_name ASC
      `,
      [alumniId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mentees" });
  }
};

module.exports = {
  createMentorshipRequest,
  getStudentRequests,
  getMentorRequests,
  updateRequestStatus,
  getMyMentors,
  getMyMentees,
};