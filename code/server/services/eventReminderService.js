const pool = require("../config/db");

async function ensureMandatoryReminders() {
  await pool.query(`
    INSERT INTO event_reminders (registration_id, minutes_before)
    SELECT id, 0 FROM event_registrations
    ON CONFLICT (registration_id, minutes_before) DO NOTHING
  `);
}

async function dispatchDueEventReminders() {
  try {
    const eventTimezone = "Asia/Colombo";
    const result = await pool.query(`
      WITH due AS (
        SELECT r.id, er.student_user_id, e.id AS event_id, e.title, e.venue, r.minutes_before
        FROM event_reminders r
        JOIN event_registrations er ON er.id = r.registration_id
        JOIN events e ON e.id = er.event_id
        WHERE r.sent_at IS NULL
          AND ((e.event_date + e.event_time) AT TIME ZONE $1)
              - (r.minutes_before * INTERVAL '1 minute') <= CURRENT_TIMESTAMP
          AND ((r.minutes_before > 0
                AND ((e.event_date + e.event_time) AT TIME ZONE $1) > CURRENT_TIMESTAMP)
            OR (r.minutes_before = 0
                AND ((e.event_date + e.event_time) AT TIME ZONE $1) >= CURRENT_TIMESTAMP - INTERVAL '24 hours'))
        FOR UPDATE OF r SKIP LOCKED
      ), created AS (
        INSERT INTO notifications (user_id, title, message, type)
        SELECT student_user_id,
          CASE WHEN minutes_before = 0 THEN 'Event starting now' ELSE 'Event reminder' END,
          CASE minutes_before
            WHEN 0 THEN '"' || title || '" is starting now at ' || venue || '.'
            WHEN 60 THEN '"' || title || '" starts in 1 hour at ' || venue || '.'
            WHEN 1440 THEN '"' || title || '" starts in 1 day at ' || venue || '.'
            WHEN 2880 THEN '"' || title || '" starts in 2 days at ' || venue || '.'
            WHEN 10080 THEN '"' || title || '" starts in 1 week at ' || venue || '.'
          END,
          'EVENT_REMINDER:' || event_id
        FROM due
      )
      UPDATE event_reminders SET sent_at = CURRENT_TIMESTAMP
      WHERE id IN (SELECT id FROM due)
    `, [eventTimezone]);
    return result.rowCount;
  } catch (error) {
    console.error("Event reminder dispatch failed:", error);
    return 0;
  }
}

function startEventReminderService() {
  ensureMandatoryReminders()
    .then(dispatchDueEventReminders)
    .catch((error) => console.error("Event reminder startup failed:", error));
  const timer = setInterval(dispatchDueEventReminders, 30 * 1000);
  timer.unref();
  return timer;
}

module.exports = { dispatchDueEventReminders, ensureMandatoryReminders, startEventReminderService };
