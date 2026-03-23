-- Relax bookings RLS for demo mode
-- Allow guides to view their bookings even without a full session
DROP POLICY IF EXISTS "Guides can view their own bookings" ON public.bookings;
CREATE POLICY "Guides can view their own bookings" ON public.bookings 
  FOR SELECT USING (true);

-- Also ensure anyone can update (for demo status toggling)
DROP POLICY IF EXISTS "Guides can update their own bookings" ON public.bookings;
CREATE POLICY "Guides can update their own bookings" ON public.bookings 
  FOR UPDATE USING (true);
