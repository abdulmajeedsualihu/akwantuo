-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  tourist_name TEXT NOT NULL,
  tourist_phone TEXT,
  booking_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Guides can view bookings for their own profile
CREATE POLICY "Guides can view their own bookings" ON public.bookings 
  FOR SELECT USING (auth.uid() = guide_id);

-- Anyone can create a booking (tourists might not be logged in)
CREATE POLICY "Anyone can create a booking" ON public.bookings 
  FOR INSERT WITH CHECK (true);

-- Guides can update their own bookings
CREATE POLICY "Guides can update their own bookings" ON public.bookings 
  FOR UPDATE USING (auth.uid() = guide_id);

-- Timestamp update trigger
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
