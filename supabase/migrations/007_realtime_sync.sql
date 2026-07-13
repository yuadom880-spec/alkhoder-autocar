-- تفعيل Supabase Realtime لتحديث الحجوزات (أدمن) والسيارات (عميل) تلقائياً
-- شغّل في SQL Editor إن لم تُحدَّث schema.sql كاملاً

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cars'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cars;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'featured_offers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.featured_offers;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';