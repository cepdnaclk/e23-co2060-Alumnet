const  pool  = require("../config/db");
const {
  createNotification,
  createNotificationsForRoles,
} = require("../utils/notify");
const {
  sendUserNotificationEmail,
  sendRoleNotificationEmail,
} = require("../utils/emailNotifications");

const ALLOWED_REMINDER_MINUTES = new Set([60, 1440, 2880, 10080]);

const calculateEventDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const [startHour, startMinute] = String(startTime).split(":").map(Number);
  const [endHour, endMinute] = String(endTime).split(":").map(Number);
  const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (totalMinutes <= 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [
    hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "",
    minutes ? `${minutes} minute${minutes === 1 ? "" : "s"}` : "",
  ].filter(Boolean).join(" ");
};

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
      ending_time,
      venue,
      description,
      available_slots,
      image_url,
      speaker,
      zoom_link,
      event_type,
      event_details,
    } = req.body;

    const allowedEventTypes = new Set([
      "lecture",
      "workshop",
      "conference",
      "competition",
      "other",
    ]);
    const normalizedEventType = String(event_type || "other").toLowerCase();

    if (!allowedEventTypes.has(normalizedEventType)) {
      return res.status(400).json({ message: "Invalid event type" });
    }

    if (!title || !event_date || !event_time || !venue) {
      return res.status(400).json({
        message: "title, event_date, event_time, and venue are required",
      });
    }

    const supportsEndingTime = ["lecture", "workshop", "conference"].includes(normalizedEventType);
    if (ending_time && !supportsEndingTime) {
      return res.status(400).json({ message: "Ending time is only available for lectures, workshops, and conferences" });
    }
    if (ending_time && ending_time <= event_time) {
      return res.status(400).json({ message: "Ending time must be later than starting time" });
    }
    if (["conference", "competition"].includes(normalizedEventType)) {
      const deadline = String(event_details?.registration_deadline || "");
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline) || Number.isNaN(Date.parse(deadline))) {
        return res.status(400).json({ message: "A valid registration deadline is required for conferences and competitions" });
      }
    }

    const approvalStatus =
      role === "university_admin" || role === "system_admin"
        ? "approved"
        : "pending";
    const normalizedEventDetails = { ...(event_details || {}) };
    if (normalizedEventType === "workshop") {
      normalizedEventDetails.duration = calculateEventDuration(event_time, ending_time);
    }

    const result = await pool.query(
      `
      INSERT INTO events (
        title,
        event_date,
        event_time,
        ending_time,
        venue,
        description,
        available_slots,
        image_url,
        speaker,
        zoom_link,
        event_type,
        event_details,
        created_by,
        approval_status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *
      `,
      [
        title,
        event_date,
        event_time,
        ending_time || null,
        venue,
        description || null,
        Number(available_slots) || 0,
        image_url || null,
        speaker || null,
        zoom_link || null,
        normalizedEventType,
        normalizedEventDetails,
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

      sendRoleNotificationEmail({
        category: "event",
        roles: ["university_admin", "system_admin"],
        subject: `Event awaiting approval: ${result.rows[0].title}`,
        heading: "A new event needs approval",
        message: `An alumnus submitted "${result.rows[0].title}". Review the event details and approve or reject it.`,
        buttonText: "Review event",
        buttonPath: "/admin-events",
        details: [
          { label: "Date", value: event_date },
          { label: "Time", value: event_time },
          { label: "Venue", value: venue },
        ],
      });
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
        (CASE WHEN e.ending_time IS NOT NULL
          THEN (e.event_date + e.ending_time) <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')
          ELSE e.event_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date
        END) AS is_past,
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
        (CASE WHEN e.ending_time IS NOT NULL
          THEN (e.event_date + e.ending_time) <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')
          ELSE e.event_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date
        END) AS is_past,
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
      WHERE id = $1 AND approval_status <> 'approved'
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      const existing = await pool.query(
        "SELECT approval_status FROM events WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ message: "Event not found" });
      }

      return res.status(409).json({ message: "Event is already approved" });
    }

    await createNotification(
      result.rows[0].created_by, // The user ID of the event handler
      "Event Approved",
      `Your event "${result.rows[0].title}" has been approved and is now live!`,
      "EVENT_UPDATE"
    );

    await createNotificationsForRoles(
      ["student"],
      "New Event Added",
      `A new event "${result.rows[0].title}" has been added. Visit Events to view the details and register.`,
      `NEW_EVENT:${result.rows[0].id}`
    );

    sendUserNotificationEmail({
      category: "event",
      userId: result.rows[0].created_by,
      subject: `Your event "${result.rows[0].title}" was approved`,
      heading: "Your event is now live",
      message: `Your event "${result.rows[0].title}" has been approved by the administration and is now visible on Alumnet.`,
      buttonText: "View event",
      buttonPath: `/events/${result.rows[0].id}`,
    });

    sendRoleNotificationEmail({
        category: "event",
      roles: ["student"],
      subject: `New Alumnet event: ${result.rows[0].title}`,
      heading: "A new event is available",
      message: `"${result.rows[0].title}" has been added to Alumnet. View the details and register before the available slots are filled.`,
      buttonText: "View event",
      buttonPath: `/events/${result.rows[0].id}`,
      details: [
        { label: "Date", value: result.rows[0].event_date },
        { label: "Time", value: result.rows[0].event_time },
        { label: "Venue", value: result.rows[0].venue },
      ],
    });

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

    sendUserNotificationEmail({
      category: "event",
      userId: result.rows[0].created_by,
      subject: `Update on your event "${result.rows[0].title}"`,
      heading: "Your event was not approved",
      message: `Your event "${result.rows[0].title}" was declined by the administration. You can review and update the event before submitting it again.`,
      buttonText: "View my events",
      buttonPath: "/my-created-events",
    });

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
    const requestedReminders = Array.isArray(req.body.reminder_minutes)
      ? [...new Set(req.body.reminder_minutes.map(Number))]
      : [];

    if (requestedReminders.some((minutes) => !ALLOWED_REMINDER_MINUTES.has(minutes))) {
      return res.status(400).json({ message: "Invalid event reminder preference" });
    }

    if (role !== "student") {
      return res.status(403).json({
        message: "Only students can register for events",
      });
    }

    const eventResult = await pool.query(
      `
      SELECT
        e.*,
        (((e.event_date + e.event_time) AT TIME ZONE 'Asia/Colombo') <= CURRENT_TIMESTAMP) AS event_has_started,
        (CASE WHEN e.event_type IN ('conference', 'competition')
          AND COALESCE(e.event_details->>'registration_deadline', '') ~ '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}'
          THEN ((e.event_details->>'registration_deadline')::timestamp AT TIME ZONE 'Asia/Colombo') <= CURRENT_TIMESTAMP
          ELSE FALSE END) AS registration_deadline_passed,
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

    if (event.event_has_started) {
      return res.status(400).json({
        message: "Registration has closed because this event has started",
      });
    }

    if (event.registration_deadline_passed) {
      return res.status(400).json({
        message: "Registration has closed because the registration deadline has passed",
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

    const reminderMinutes = [0, ...requestedReminders];
    const client = await pool.connect();
    let registration;
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO event_registrations (event_id, student_user_id)
         VALUES ($1, $2)
         RETURNING *`,
        [eventId, studentUserId]
      );
      registration = result.rows[0];
      // Reminder support was added after event registrations. Keep joining an
      // event working while an older deployment is waiting for that migration.
      await client.query("SAVEPOINT event_reminders_insert");
      try {
        await client.query(
          `INSERT INTO event_reminders (registration_id, minutes_before, sent_at)
           SELECT $1, selected.minutes_before,
             CASE
               WHEN selected.minutes_before > 0
                AND ((e.event_date + e.event_time) AT TIME ZONE 'Asia/Colombo')
                    - (selected.minutes_before * INTERVAL '1 minute') <= CURRENT_TIMESTAMP
               THEN CURRENT_TIMESTAMP
               ELSE NULL
             END
           FROM UNNEST($2::integer[]) AS selected(minutes_before)
           CROSS JOIN events e
           WHERE e.id = $3
           ON CONFLICT (registration_id, minutes_before) DO NOTHING`,
          [registration.id, reminderMinutes, eventId]
        );
      } catch (reminderError) {
        await client.query("ROLLBACK TO SAVEPOINT event_reminders_insert");
        if (reminderError.code !== "42P01") {
          throw reminderError;
        }
        console.warn(
          "event_reminders table is missing; registration saved without reminders"
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    await createNotification(
      event.created_by,
      "New Event Registration",
      `A student has registered for your event: "${event.title}".`,
      "EVENT_REGISTRATION"
    );

    const studentResult = await pool.query(
      "SELECT full_name FROM users WHERE id = $1",
      [studentUserId]
    );
    const studentName = studentResult.rows[0]?.full_name || "A student";

    sendUserNotificationEmail({
      category: "event",
      userId: event.created_by,
      subject: `New registration for "${event.title}"`,
      heading: "A student registered for your event",
      message: `${studentName} has registered for "${event.title}".`,
      buttonText: "View event",
      buttonPath: `/events/${event.id}`,
      details: [{ label: "Student", value: studentName }],
    });

    return res.status(201).json({
      message: "Registered for event successfully",
      registration,
      reminder_minutes: reminderMinutes,
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
        (CASE WHEN e.ending_time IS NOT NULL
          THEN (e.event_date + e.ending_time) <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')
          ELSE e.event_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date
        END) AS is_past,
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
        (CASE WHEN e.ending_time IS NOT NULL
          THEN (e.event_date + e.ending_time) <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')
          ELSE e.event_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date
        END) AS is_past,
        (CASE WHEN e.event_type IN ('conference', 'competition')
          AND COALESCE(e.event_details->>'registration_deadline', '') ~ '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}'
          THEN ((e.event_details->>'registration_deadline')::timestamp AT TIME ZONE 'Asia/Colombo') <= CURRENT_TIMESTAMP
          ELSE FALSE END) AS registration_deadline_passed,
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
      ending_time,
      venue,
      description,
      available_slots,
      image_url,
      speaker,
      zoom_link,
      event_type,
      event_details,
    } = req.body;

    const allowedEventTypes = new Set(["lecture", "workshop", "conference", "competition", "other"]);
    const normalizedEventType = String(event_type || "").toLowerCase();
    if (!allowedEventTypes.has(normalizedEventType)) {
      return res.status(400).json({ message: "Please select a valid event type" });
    }

    if (!title || !event_date || !event_time || !venue) {
      return res.status(400).json({
        message: "title, event_date, event_time, and venue are required",
      });
    }

    const supportsEndingTime = ["lecture", "workshop", "conference"].includes(normalizedEventType);
    if (ending_time && !supportsEndingTime) {
      return res.status(400).json({ message: "Ending time is only available for lectures, workshops, and conferences" });
    }
    if (ending_time && ending_time <= event_time) {
      return res.status(400).json({ message: "Ending time must be later than starting time" });
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
    if (["conference", "competition"].includes(normalizedEventType)) {
      const deadline = String(event_details?.registration_deadline || "");
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline) || Number.isNaN(Date.parse(deadline))) {
        return res.status(400).json({ message: "A valid registration deadline is required for conferences and competitions" });
      }
    }
    const updatedEventDetails = { ...(event_details || {}) };
    if (normalizedEventType === "workshop") {
      updatedEventDetails.duration = calculateEventDuration(event_time, ending_time);
    }
    const result = await pool.query(
      `
      UPDATE events
      SET title = $1,
          event_date = $2,
          event_time = $3,
          ending_time = $4,
          venue = $5,
          description = $6,
          available_slots = $7,
          image_url = $8,
          speaker = $9,
          zoom_link = $10,
          event_details = $11,
          approval_status = $12,
          event_type = $13
      WHERE id = $14
      RETURNING *
      `,
      [
        title,
        event_date,
        event_time,
        ending_time || null,
        venue,
        description || null,
        slots,
        image_url || null,
        speaker || null,
        zoom_link || null,
        updatedEventDetails,
        approvalStatus,
        normalizedEventType,
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
        (CASE WHEN e.ending_time IS NOT NULL
          THEN (e.event_date + e.ending_time) <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')
          ELSE e.event_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date
        END) AS is_past,
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
