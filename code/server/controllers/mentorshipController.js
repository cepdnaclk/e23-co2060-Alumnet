const  pool  = require("../config/db");
const { createNotification } = require("../utils/notify");
const { sendUserNotificationEmail } = require("../utils/emailNotifications");

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
      WHERE student_user_id = $1
        AND alumni_user_id = $2
        AND status IN ('accepted', 'ending_requested')
      `,
      [studentUserId, alumni_user_id]
    );

    if (existingAcceptedRequest.rows.length > 0) {
      return res.status(409).json({
        message: "They are already your mentor",
      });
    }

    const acceptedCountResult = await pool.query(
      `
      SELECT COUNT(*)::int AS accepted_count
      FROM mentorship_requests
      WHERE alumni_user_id = $1 AND status IN ('accepted', 'ending_requested')
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
    
    await createNotification(
      alumni_user_id,
      "New Mentorship Request",
      "A student has requested you as a mentor. Check your pending request page",
      "MENTOR_REQUEST"
    );

    const studentResult = await pool.query(
      "SELECT full_name FROM users WHERE id = $1",
      [studentUserId]
    );
    const studentName = studentResult.rows[0]?.full_name || "A student";

    sendUserNotificationEmail({
      category: "mentorship",
      userId: alumni_user_id,
      subject: `New mentorship request from ${studentName}`,
      heading: "You have a new mentorship request",
      message: `${studentName} has requested you as a mentor. Review the request and choose whether to accept it.`,
      buttonText: "Review request",
      buttonPath: "/mentor-requests",
      details: message
        ? [{ label: "Student message", value: message }]
        : [],
    });

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

const requestEndMentorship = async (req, res) => {
  try {
    const studentUserId = req.user.id;
    const studentRole = req.user.role;
    const { alumni_user_id, reason } = req.body;

    if (studentRole !== "student") {
      return res.status(403).json({
        message: "Only students can request to end mentorship",
      });
    }

    if (!alumni_user_id) {
      return res.status(400).json({
        message: "alumni_user_id is required",
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Please add a reason for ending mentorship",
      });
    }

    const requestResult = await pool.query(
      `
      SELECT *
      FROM mentorship_requests
      WHERE student_user_id = $1
        AND alumni_user_id = $2
        AND status IN ('accepted', 'ending_requested')
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [studentUserId, alumni_user_id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        message: "Active mentorship not found",
      });
    }

    const requestRow = requestResult.rows[0];

    if (requestRow.status === "ending_requested") {
      return res.status(409).json({
        message: "You already requested to end this mentorship",
      });
    }

    const result = await pool.query(
      `
      UPDATE mentorship_requests
      SET status = 'ending_requested',
          end_reason = $1,
          end_requested_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [reason.trim(), requestRow.id]
    );

    await createNotification(
      alumni_user_id,
      "Mentorship End Requested",
      "A mentee has requested to end your mentorship. Review it from My Mentees.",
      "MENTOR_REQUEST"
    );

    sendUserNotificationEmail({
      category: "mentorship",
      userId: alumni_user_id,
      subject: "Mentorship end requested",
      heading: "A mentee requested to end mentorship",
      message: "A mentee has requested to end the mentorship. Please review the request in My Mentees.",
      buttonText: "Review request",
      buttonPath: "/my-mentees",
      details: [{ label: "Reason", value: reason.trim() }],
    });

    return res.json({
      message: "End mentorship request sent",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Request end mentorship error:", error);
    return res.status(500).json({
      message: "Failed to request ending mentorship",
    });
  }
};

const acceptEndMentorship = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const alumniRole = req.user.role;
    const { id } = req.params;

    if (alumniRole !== "alumni") {
      return res.status(403).json({
        message: "Only alumni can end mentorship",
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
        message: "Mentorship not found",
      });
    }

    const requestRow = requestResult.rows[0];

    if (Number(requestRow.alumni_user_id) !== Number(alumniId)) {
      return res.status(403).json({
        message: "You cannot update this mentorship",
      });
    }

    if (requestRow.status !== "ending_requested") {
      return res.status(400).json({
        message: "No pending end request for this mentorship",
      });
    }

    const result = await pool.query(
      `
      UPDATE mentorship_requests
      SET status = 'ended',
          ended_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    await createNotification(
      requestRow.student_user_id,
      "Mentorship Ended",
      "Your mentor accepted the request to end this mentorship.",
      "REQUEST_UPDATE"
    );

    sendUserNotificationEmail({
      category: "mentorship",
      userId: requestRow.student_user_id,
      subject: "Your mentorship has ended",
      heading: "Mentorship ended",
      message: "Your mentor accepted your request to end the mentorship.",
      buttonText: "View mentorships",
      buttonPath: "/my-mentors",
    });

    return res.json({
      message: "Mentorship ended",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Accept end mentorship error:", error);
    return res.status(500).json({
      message: "Failed to end mentorship",
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
        mr.end_reason,
        mr.end_requested_at,
        mr.ended_at,
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
        mr.end_reason,
        mr.end_requested_at,
        mr.ended_at,
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
        WHERE alumni_user_id = $1 AND status IN ('accepted', 'ending_requested')
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

const updatedRequest = result.rows[0];

if (status === "accepted") {
  await pool.query(
    `
    INSERT INTO conversations (
      mentorship_request_id,
      student_user_id,
      alumni_user_id
    )
    VALUES ($1, $2, $3)
    ON CONFLICT (mentorship_request_id)
    DO NOTHING
    `,
    [
      updatedRequest.id,
      updatedRequest.student_user_id,
      updatedRequest.alumni_user_id,
    ]
  );
}

const title = status === "accepted" ? "Mentorship Accepted!" : "Mentorship Update";
const msg = status === "accepted"
  ? "An alumni has accepted your mentorship request. You can now chat with them!"
  : "AN alumni has declined your mentorship request at this time."

await createNotification(
  updatedRequest.student_user_id,
  title,
  msg,
  "REQUEST_UPDATE"
);

sendUserNotificationEmail({
      category: "mentorship",
  userId: updatedRequest.student_user_id,
  subject:
    status === "accepted"
      ? "Your mentorship request was accepted"
      : "Update on your mentorship request",
  heading:
    status === "accepted"
      ? "Your mentorship request was accepted"
      : "Your mentorship request was declined",
  message:
    status === "accepted"
      ? "Great news! An alumnus accepted your mentorship request. You can now connect through Alumnet chat."
      : "The alumnus was unable to accept your mentorship request at this time. You can continue exploring other available mentors.",
  buttonText: status === "accepted" ? "Open chat" : "Find another mentor",
  buttonPath: status === "accepted" ? "/chat" : "/directory",
});

res.json(updatedRequest);
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
        u.email,
        u.avatar_url,
        u.verification_status,
        mr.id AS mentorship_request_id,
        mr.status AS mentorship_status,
        mr.end_reason,
        mr.end_requested_at,
        mr.ended_at,
        ap.department,
        ap.job_title,
        ap.organization,
        ap.linkedin_url,
        ap.primary_interests,
        c.id AS conversation_id

      FROM mentorship_requests mr

      JOIN users u
        ON u.id = mr.alumni_user_id

      LEFT JOIN alumni_profiles ap
        ON ap.user_id = u.id

      LEFT JOIN conversations c
        ON c.mentorship_request_id = mr.id

      WHERE mr.student_user_id = $1
      AND mr.status IN ('accepted', 'ending_requested', 'ended')

      ORDER BY
        CASE mr.status
          WHEN 'ending_requested' THEN 0
          WHEN 'accepted' THEN 1
          ELSE 2
        END,
        u.full_name ASC
      `,
      [studentId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch mentors",
    });
  }
};

const getStudentProfileForMentor = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const alumniRole = req.user.role;
    const { id: studentId } = req.params;

    if (alumniRole !== "alumni") {
      return res.status(403).json({
        message: "Only alumni can view student profiles",
      });
    }

    const relationshipResult = await pool.query(
      `
      SELECT id, status
      FROM mentorship_requests
      WHERE alumni_user_id = $1 AND student_user_id = $2
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [alumniId, studentId]
    );

    if (relationshipResult.rows.length === 0) {
      return res.status(403).json({
        message: "You can only view profiles of students who have requested mentorship",
      });
    }

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.avatar_url,
        u.verification_status,
        sp.department,
        sp.batch,
        sp.areas_of_interest,
        sp.bio,
        sp.motivation,
        sp.goal,
        sp.linkedin_url,
        sp.github_url,
        sp.portfolio_url,
        sp.cv_url
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE u.id = $1 AND u.role = 'student'
      LIMIT 1
      `,
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.status(200).json({
      ...result.rows[0],
      mentorship_status: relationshipResult.rows[0].status,
    });
  } catch (error) {
    console.error("Student profile for mentor fetch error:", error);
    return res.status(500).json({ message: "Failed to load student profile" });
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
        mr.id AS mentorship_request_id,
        mr.status AS mentorship_status,
        mr.end_reason,
        mr.end_requested_at,
        sp.department,
        sp.batch,
        sp.areas_of_interest,
        sp.linkedin_url,
        sp.github_url,
        c.id AS conversation_id

      FROM mentorship_requests mr

      JOIN users u
        ON u.id = mr.student_user_id

      LEFT JOIN student_profiles sp
        ON sp.user_id = u.id

      LEFT JOIN conversations c
        ON c.mentorship_request_id = mr.id

      WHERE mr.alumni_user_id = $1
      AND mr.status IN ('accepted', 'ending_requested', 'ended')

      ORDER BY
        CASE mr.status
          WHEN 'ending_requested' THEN 0
          WHEN 'accepted' THEN 1
          ELSE 2
        END,
        u.full_name ASC
      `,
      [alumniId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch mentees",
    });
  }
};

module.exports = {
  createMentorshipRequest,
  requestEndMentorship,
  acceptEndMentorship,
  getStudentRequests,
  getMentorRequests,
  getStudentProfileForMentor,
  updateRequestStatus,
  getMyMentors,
  getMyMentees,
};
