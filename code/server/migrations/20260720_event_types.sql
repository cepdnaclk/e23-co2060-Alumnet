ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS event_details jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE events
  ADD CONSTRAINT events_event_type_check
  CHECK (event_type IN ('lecture', 'workshop', 'conference', 'competition', 'other'));
