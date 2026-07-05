const  pool  = require("../config/db");
const {
  createNotification,
  createNotificationsForRoles,
} = require("../utils/notify");

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
      image_url,
      speaker,
      zoom_link,
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
        image_url,
        speaker,
        zoom_link,
        created_by,
        approval_status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9, $10, $11)
      RETURNING *
      `,
      [
        title,
        event_date,
        event_time,
        venue,
        description || null,
        Number(available_slots) || 0,
        image_url || null,
        speaker || null,
        zoom_link || null,
        userId,
        approvalStatus,
      ]
    );

    if (approvalStatus === "pending") {
      await createNotificationsForRoles(
        ["university_admin", "system_admin"],
        "New Event Awaiting Approval",
        `A new event "${result.rows[0].title}" has been submitted by an alumnus and is waiting for approval.`,
        "EVENT_UPDATE"
      );
    }

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
        ) AS registered_count,
        EXISTS (
          SELECT 1
          FROM event_registrations er
          WHERE er.event_id = e.id
          AND er.student_user_id = $1
        ) AS is_registered
      FROM events e
      JOIN users u ON u.id = e.created_by
      WHERE e.approval_status = 'approved'
      ORDER BY e.event_date ASC, e.event_time ASC
      `,
      [req.user.id]
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

const getAdminEvents = async (req, res) => {
  try {
    if (!["university_admin", "system_admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

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
      ORDER BY e.created_at DESC
      `
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get admin events error:", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

const getEventStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (!["university_admin", "system_admin"].includes(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await pool.query(`
      SELECT approval_status, COUNT(*)::int AS count
      FROM events
      GROUP BY approval_status
    `);

    const counts = result.rows.reduce(
      (acc, row) => {
        acc[row.approval_status] = row.count;
        acc.total += row.count;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0 }
    );

    return res.status(200).json(counts);
  } catch (error) {
    console.error("Get event stats error:", error);
    return res.status(500).json({ message: "Failed to fetch event statistics" });
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

    await createNotification(
      result.rows[0].created_by, // The user ID of the event handler
      "Event Approved",
      `Your event "${result.rows[0].title}" has been approved and is now live!`,
      "EVENT_UPDATE"
    );

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

    await createNotification(
      result.rows[0].created_by,
      "Event Rejected",
      `Your event "${result.rows[0].title}" was declined by the administration.`,
      "EVENT_UPDATE"
    );

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

    await createNotification(
      event.created_by,
      "New Event Registration",
      `A student has been registered to your event: "${event.title}".`,
      "EVENT_REGISTRATION"
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

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        e.*,
        u.full_name AS created_by_name,
        (
          SELECT COUNT(*)::int
          FROM event_registrations er
          WHERE er.event_id = e.id
        ) AS registered_count,
        EXISTS (
          SELECT 1
          FROM event_registrations er
          WHERE er.event_id = e.id
          AND er.student_user_id = $2
        ) AS is_registered
      FROM events e
      JOIN users u ON u.id = e.created_by
      WHERE e.id = $1
      LIMIT 1
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = result.rows[0];
    const isAdmin = ["university_admin", "system_admin"].includes(req.user.role);
    const isOwner = Number(event.created_by) === Number(req.user.id);

    if (event.approval_status !== "approved" && !isAdmin && !isOwner) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Get event by id error:", error);
    return res.status(500).json({ message: "Failed to fetch event" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;
    const isAdmin = ["university_admin", "system_admin"].includes(role);

    if (!["alumni", "university_admin", "system_admin"].includes(role)) {
      return res.status(403).json({ message: "Not authorized to edit events" });
    }

    const existingResult = await pool.query(
      `
      SELECT e.*,
        (SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id) AS registered_count
      FROM events e
      WHERE e.id = $1
      `,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingEvent = existingResult.rows[0];
    if (!isAdmin && Number(existingEvent.created_by) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only edit your own events" });
    }

    const {
      title,
      event_date,
      event_time,
      venue,
      description,
      available_slots,
      image_url,
      speaker,
      zoom_link,
    } = req.body;

    if (!title || !event_date || !event_time || !venue) {
      return res.status(400).json({
        message: "title, event_date, event_time, and venue are required",
      });
    }

    const slots = Number(available_slots);
    if (!Number.isInteger(slots) || slots < 0) {
      return res.status(400).json({
        message: "Available slots must be a non-negative whole number",
      });
    }
    if (slots < Number(existingEvent.registered_count)) {
      return res.status(400).json({
        message: `Available slots cannot be less than the ${existingEvent.registered_count} existing registrations`,
      });
    }

    const approvalStatus = isAdmin ? existingEvent.approval_status : "pending";
    const result = await pool.query(
      `
      UPDATE events
      SET title = $1,
          event_date = $2,
          event_time = $3,
          venue = $4,
          description = $5,
          available_slots = $6,
          image_url = $7,
          speaker = $8,
          zoom_link = $9,
          approval_status = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        title,
        event_date,
        event_time,
        venue,
        description || null,
        slots,
        image_url || null,
        speaker || null,
        zoom_link || null,
        approvalStatus,
        id,
      ]
    );

    return res.status(200).json({
      message: isAdmin
        ? "Event updated successfully"
        : "Event updated and sent for admin approval",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({ message: "Failed to update event" });
  }
};

const getMyCreatedEvents = async (req, res) => {
  try {
    const userId = req.user.id;

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
      WHERE e.created_by = $1
      ORDER BY e.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get my created events error:", error);
    return res.status(500).json({ message: "Failed to fetch your events" });
  }
};

module.exports = {
  createEvent,
  getApprovedEvents,
  getPendingEvents,
  getAdminEvents,
  getEventStats,
  approveEvent,
  rejectEvent,
  registerForEvent,
  getMyRegisteredEvents,
  getEventById,
  getMyCreatedEvents,
  updateEvent,
};
