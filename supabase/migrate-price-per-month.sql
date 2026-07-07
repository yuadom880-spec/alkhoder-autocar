-- إضافة السعر الشهري للسيارات ونوع الإيجار للحجوزات
-- نفّذ في Supabase SQL Editor

ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_month NUMERIC(10,2);

UPDATE cars
SET price_per_month = ROUND(price_per_day * 25, 2)
WHERE price_per_month IS NULL;

ALTER TABLE cars ALTER COLUMN price_per_month SET DEFAULT 0;
ALTER TABLE cars ALTER COLUMN price_per_month SET NOT NULL;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_type TEXT NOT NULL DEFAULT 'daily'
  CHECK (rental_type IN ('daily', 'monthly'));