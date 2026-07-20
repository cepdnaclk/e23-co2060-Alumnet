CREATE TABLE IF NOT EXISTS event_reminders (
  id bigserial PRIMARY KEY,
  registration_id integer NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  minutes_before integer NOT NULL CHECK (minutes_before IN (0, 60, 1440, 2880, 10080)),
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (registration_id, minutes_before)
);

CREATE INDEX IF NOT EXISTS idx_event_reminders_unsent ON event_reminders (sent_at) WHERE sent_at IS NULL;

INSERT INTO event_reminders (registration_id, minutes_before)
SELECT id, 0 FROM event_registrations
ON CONFLICT (registration_id, minutes_before) DO NOTHING;
