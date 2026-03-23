-- Add availability_settings column to storefronts
-- Stores working hours and booking availability as JSONB
ALTER TABLE public.storefronts
  ADD COLUMN IF NOT EXISTS availability_settings JSONB;

-- Default value example:
-- {
--   "accepting_bookings": true,
--   "working_hours": {
--     "Monday": { "enabled": true, "start": "09:00", "end": "17:00" },
--     "Tuesday": { "enabled": true, "start": "09:00", "end": "17:00" },
--     ...
--   }
-- }
