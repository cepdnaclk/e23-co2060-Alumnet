-- Run this migration manually in the Supabase SQL editor.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS ending_time time without time zone;

COMMENT ON COLUMN public.events.ending_time IS
  'Optional same-day ending time for lectures, workshops, and conferences.';

