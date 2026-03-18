const { pool } = require("../src/db");

const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (!["alumni", "university_admin", "system_admin"].includes(role)) {
      return res.status(403).json({
        message: "Only alumni or admins can create events",
      });
    }

    const {
      title,
      event_date,
      event_time,
      venue,
      description,
      available_slots,
    } = req.body;

    if (!title || !event_date || !event_time || !venue) {
      return res.status(400).json({
        message: "title, event_date, event_time, and venue are required",
      });
    }

    const approvalStatus =
      role === "university_admin" || role === "system_admin"
        ? "approved"
        : "pending";

    const result = await pool.query(
      `
      INSERT INTO events (
        title,
        event_date,
        event_time,
        venue,
        description,
        available_slots,
        created_by,
        approval_status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        title,
        event_date,
        event_time,
        venue,
        description || null,
        Number(available_slots) || 0,
        userId,
        approvalStatus,
      ]
    );

    return res.status(201).json({
      message:
        approvalStatus === "approved"
          ? "Event created successfully"
          : "Event created and pending admin approval",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

const getApprovedEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        e.*,
        u.full_name AS created_by_name,
        (
          SELECT COUNT(*)::int
          FROM event_registrations er
          WHERE er.event_id = e.id
        ) AS registered_count
      FROM events e
      JOIN users u ON u.id = e.created_by
      WHERE e.approval_status = 'approved'
      ORDER BY e.event_date ASC, e.event_time ASC
      `
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get approved events error:", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const role = req.user.role;

    if (!["university_admin", "system_admin"].includes(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await pool.query(
      `
      SELECT
        e.*,
        u.full_name AS created_by_name
      FROM events e
      JOIN users u ON u.id = e.created_by
      WHERE e.approval_status = 'pending'
      ORDER BY e.created_at DESC
      `
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get pending events error:", error);
    return res.status(500).json({ message: "Failed to fetch pending events" });
  }
};

const approveEvent = async (req, res) => {
  try {
    const role = req.user.role;

    if (!["university_admin", "system_admin"].includes(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE events
      SET approval_status = 'approved'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event approved successfully",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Approve event error:", error);
    return res.status(500).json({ message: "Failed to approve event" });
  }
};

const rejectEvent = async (req, res) => {
  try {
    const role = req.user.role;

    if (!["university_admin", "system_admin"].includes(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE events
      SET approval_status = 'rejected'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event rejected",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Reject event error:", error);
    return res.status(500).json({ message: "Failed to reject event" });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const studentUserId = req.user.id;
    const role = req.user.role;
    const { eventId } = req.params;

    if (role !== "student") {
      return res.status(403).json({
        message: "Only students can register for events",
      });
    }

    const eventResult = await pool.query(
      `
      SELECT
        e.*,
        (
          SELECT COUNT(*)::int
          FROM event_registrations er
          WHERE er.event_id = e.id
        ) AS registered_count
      FROM events e
      WHERE e.id = $1
      `,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = eventResult.rows[0];

    if (event.approval_status !== "approved") {
      return res.status(400).json({
        message: "Only approved events can be joined",
      });
    }

    if (Number(event.registered_count) >= Number(event.available_slots)) {
      return res.status(400).json({
        message: "This event is full",
      });
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM event_registrations
      WHERE event_id = $1 AND student_user_id = $2
      `,
      [eventId, studentUserId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "You have already registered for this event",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO event_registrations (event_id, student_user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [eventId, studentUserId]
    );

    return res.status(201).json({
      message: "Registered for event successfully",
      registration: result.rows[0],
    });
  } catch (error) {
    console.error("Register for event error:", error);
    return res.status(500).json({ message: "Failed to register for event" });
  }
};

const getMyRegisteredEvents = async (req, res) => {
  try {
    const studentUserId = req.user.id;
    const role = req.user.role;

    if (role !== "student") {
      return res.status(403).json({
        message: "Only students can view registered events",
      });
    }

    const result = await pool.query(
      `
      SELECT
        e.*,
        er.registered_at,
        u.full_name AS created_by_name
      FROM event_registrations er
      JOIN events e ON e.id = er.event_id
      JOIN users u ON u.id = e.created_by
      WHERE er.student_user_id = $1
      ORDER BY e.event_date ASC, e.event_time ASC
      `,
      [studentUserId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get my registered events error:", error);
    return res.status(500).json({ message: "Failed to fetch registered events" });
  }
};

module.exports = {
  createEvent,
  getApprovedEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  registerForEvent,
  getMyRegisteredEvents,
};