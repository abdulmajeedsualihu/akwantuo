-- Relax RLS for bookings table in demo mode
-- The existing policies use auth.uid() which is null in our phone-bypass flow.
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- If we wanted to keep RLS, we would need to check against the user_id/guide_id directly
-- without relying on auth.uid(), but for this demo phase, disabling is consistent with profiles/storefronts.
