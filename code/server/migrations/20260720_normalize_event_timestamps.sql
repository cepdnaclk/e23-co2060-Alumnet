BEGIN;

ALTER TABLE event_registrations
  ALTER COLUMN registered_at TYPE timestamp with time zone
  USING registered_at AT TIME ZONE 'UTC';

ALTER TABLE notifications
  ALTER COLUMN created_at TYPE timestamp with time zone
  USING created_at AT TIME ZONE 'UTC';

ALTER TABLE event_reminders
  ALTER COLUMN sent_at TYPE timestamp with time zone
  USING sent_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamp with time zone
  USING created_at AT TIME ZONE 'UTC';

COMMIT;
