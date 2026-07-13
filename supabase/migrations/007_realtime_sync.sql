-- Supabase Realtime — مُستخرج تلقائياً من supabase/schema.sql (القسم 15)
-- المصدر الرئيسي: schema.sql — عدّل هناك ثم شغّل: npm run db:sync-schema

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
