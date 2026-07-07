-- ============================================================
-- الخضر لتأجير السيارات - Alkhoder AutoCar
-- ملف SQL كامل — انسخه والصقه في Supabase SQL Editor
-- آمن للتشغيل على قاعدة جديدة أو موجودة (idempotent)
-- ============================================================

-- ─── دوال مساعدة ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── جدول السيارات ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sedan', 'hatchback', 'crossover', 'suv', 'van', 'pickup')),
  car_class TEXT NOT NULL DEFAULT 'mid' CHECK (car_class IN ('economy', 'mid', 'family', 'executive', 'luxury', 'sports')),
  price_per_day NUMERIC(10,2) NOT NULL,
  price_per_month NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  offer JSONB DEFAULT NULL,
  branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── جدول الحجوزات ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_id_number TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  rental_type TEXT NOT NULL DEFAULT 'daily' CHECK (rental_type IN ('daily', 'monthly')),
  price_per_day NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  pickup_time TEXT DEFAULT NULL,
  promo_offer_id TEXT DEFAULT NULL,
  promo_title TEXT DEFAULT NULL,
  branch_id UUID DEFAULT NULL,
  branch_name TEXT DEFAULT NULL,
  branch_city TEXT DEFAULT NULL,
  branch_phone TEXT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── جدول العروض المميزة ───────────────────────────────────

CREATE TABLE IF NOT EXISTS featured_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  rental_type TEXT NOT NULL CHECK (rental_type IN ('daily', 'monthly')),
  image_url TEXT NOT NULL,
  badge_text TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2) DEFAULT NULL,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  link_url TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  valid_until DATE DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── جدول الفروع ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT DEFAULT NULL,
  hours TEXT DEFAULT 'السبت - الخميس: 8 ص - 11 م | الجمعة: 4 م - 11 م',
  map_url TEXT DEFAULT '#',
  image_url TEXT DEFAULT NULL,
  is_main BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── ترقية الجداول الموجودة (أعمدة قديمة) ──────────────────

ALTER TABLE cars ADD COLUMN IF NOT EXISTS offer JSONB DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_month NUMERIC(10,2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS car_class TEXT DEFAULT 'mid';

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_offer_id TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_title TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_type TEXT DEFAULT 'daily';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_id UUID DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_name TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_city TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_phone TEXT DEFAULT NULL;

-- ربط فرع الحجز بجدول الفروع (إن وُجد)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_branch_id_fkey'
      AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_branch_id_fkey
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── ترحيل البيانات القديمة ────────────────────────────────

-- تصنيفات قديمة → التصنيفات الجديدة
UPDATE cars SET category = 'sedan'   WHERE category = 'economy';
UPDATE cars SET category = 'suv'     WHERE category IN ('family', 'luxury');
UPDATE cars SET category = 'sedan'   WHERE category = 'sports';
UPDATE cars SET category = 'van'     WHERE category = 'commercial';

-- السعر الشهري للسيارات القديمة
UPDATE cars
SET price_per_month = ROUND(price_per_day * 25, 2)
WHERE price_per_month IS NULL;

ALTER TABLE cars ALTER COLUMN price_per_month SET DEFAULT 0;

-- نوع الإيجار للحجوزات القديمة
UPDATE bookings SET rental_type = 'daily' WHERE rental_type IS NULL;

-- فئة السيارة للبيانات القديمة
UPDATE cars SET car_class = 'mid' WHERE car_class IS NULL;

-- ─── قيود التصنيف (التصنيفات الحالية) ──────────────────────

ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_category_check;
ALTER TABLE cars
  ADD CONSTRAINT cars_category_check
  CHECK (category IN ('sedan', 'hatchback', 'crossover', 'suv', 'van', 'pickup'));

ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_car_class_check;
ALTER TABLE cars
  ADD CONSTRAINT cars_car_class_check
  CHECK (car_class IN ('economy', 'mid', 'family', 'executive', 'luxury', 'sports'));

-- ─── Triggers ───────────────────────────────────────────────

DROP TRIGGER IF EXISTS cars_updated_at ON cars;
CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS featured_offers_updated_at ON featured_offers;
CREATE TRIGGER featured_offers_updated_at
  BEFORE UPDATE ON featured_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS branches_updated_at ON branches;
CREATE TRIGGER branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── دالة التحقق من توفر السيارات ───────────────────────────

CREATE OR REPLACE FUNCTION public.get_booking_blocks(p_car_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  car_id UUID,
  start_date DATE,
  end_date DATE,
  status TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT b.id, b.car_id, b.start_date, b.end_date, b.status
  FROM bookings b
  WHERE b.status IN ('pending', 'confirmed')
    AND (p_car_id IS NULL OR b.car_id = p_car_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_blocks(UUID) TO anon, authenticated;

-- ─── Row Level Security ─────────────────────────────────────

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "featured_offers_public_read" ON featured_offers;
CREATE POLICY "featured_offers_public_read" ON featured_offers
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "featured_offers_admin_all" ON featured_offers;
CREATE POLICY "featured_offers_admin_all" ON featured_offers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cars_public_read" ON cars;
CREATE POLICY "cars_public_read" ON cars FOR SELECT USING (true);

DROP POLICY IF EXISTS "cars_admin_insert" ON cars;
CREATE POLICY "cars_admin_insert" ON cars FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cars_admin_update" ON cars;
CREATE POLICY "cars_admin_update" ON cars FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cars_admin_delete" ON cars;
CREATE POLICY "cars_admin_delete" ON cars FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "bookings_public_insert" ON bookings;
CREATE POLICY "bookings_public_insert" ON bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_public_select" ON bookings;
CREATE POLICY "bookings_public_select" ON bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "bookings_admin_select" ON bookings;
CREATE POLICY "bookings_admin_select" ON bookings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "bookings_admin_update" ON bookings;
CREATE POLICY "bookings_admin_update" ON bookings FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "bookings_admin_delete" ON bookings;
CREATE POLICY "bookings_admin_delete" ON bookings FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "branches_public_read" ON branches;
CREATE POLICY "branches_public_read" ON branches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "branches_public_insert" ON branches;
CREATE POLICY "branches_public_insert" ON branches
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "branches_public_update" ON branches;
CREATE POLICY "branches_public_update" ON branches
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "branches_public_delete" ON branches;
CREATE POLICY "branches_public_delete" ON branches
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "branches_admin_all" ON branches;
CREATE POLICY "branches_admin_all" ON branches
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Storage (صور السيارات) ─────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "car_images_public_read" ON storage.objects;
CREATE POLICY "car_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-images');

DROP POLICY IF EXISTS "car_images_public_upload" ON storage.objects;
CREATE POLICY "car_images_public_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'car-images');

DROP POLICY IF EXISTS "car_images_admin_upload" ON storage.objects;
CREATE POLICY "car_images_admin_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'car-images');

DROP POLICY IF EXISTS "car_images_public_update" ON storage.objects;
CREATE POLICY "car_images_public_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'car-images');

DROP POLICY IF EXISTS "car_images_public_delete" ON storage.objects;
CREATE POLICY "car_images_public_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'car-images');

DROP POLICY IF EXISTS "car_images_admin_delete" ON storage.objects;
CREATE POLICY "car_images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'car-images');

-- ─── بيانات تجريبية (فقط إذا جدول السيارات فاضي) ───────────

INSERT INTO cars (
  name, brand, model, year, category,
  price_per_day, price_per_month,
  image_url, images, specs, description, is_available, is_featured
)
SELECT * FROM (VALUES
  ('تويوتا كامري 2024', 'تويوتا', 'كامري', 2024, 'sedan', 150, 3750,
   'https://images.unsplash.com/photo-1621007947382-bcb3e395748f?w=800&q=80',
   '["https://images.unsplash.com/photo-1621007947382-bcb3e395748f?w=800&q=80"]'::jsonb,
   '{"transmission":"أوتوماتيك","fuel":"بنزين","seats":5,"doors":4,"ac":true}'::jsonb,
   'سيارة سيدان مريحة واقتصادية', true, true),
  ('هيونداي توسان 2023', 'هيونداي', 'توسان', 2023, 'suv', 200, 5000,
   'https://images.unsplash.com/photo-1519641471654-76cefd7816fa?w=800&q=80',
   '["https://images.unsplash.com/photo-1519641471654-76cefd7816fa?w=800&q=80"]'::jsonb,
   '{"transmission":"أوتوماتيك","fuel":"بنزين","seats":5,"doors":4,"ac":true}'::jsonb,
   'دفع رباعي عائلية واسعة', true, true),
  ('مرسيدس E-Class 2024', 'مرسيدس', 'E-Class', 2024, 'sedan', 450, 11250,
   'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
   '["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"]'::jsonb,
   '{"transmission":"أوتوماتيك","fuel":"بنزين","seats":5,"doors":4,"ac":true}'::jsonb,
   'سيارة فاخرة للمناسبات', true, true)
) AS v(name, brand, model, year, category, price_per_day, price_per_month, image_url, images, specs, description, is_available, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM cars LIMIT 1);