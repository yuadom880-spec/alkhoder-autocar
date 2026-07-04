-- ربط السيارات بالفروع + تسجيل فرع الحجز
-- نفّذ في Supabase SQL Editor

ALTER TABLE cars ADD COLUMN IF NOT EXISTS branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_name TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_city TEXT DEFAULT NULL;