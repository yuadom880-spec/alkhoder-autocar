-- ════════════════════════════════════════════════════════════════════════════
-- الخضر لتأجير السيارات — Alkhoder AutoCar
-- الإصدار: 4.7 | التاريخ: 2026-07-13 | الملف: supabase/schema.sql
-- ════════════════════════════════════════════════════════════════════════════
-- انسخ الملف كاملاً (Ctrl+A) والصقه في Supabase → SQL Editor → Run
-- آمن للتشغيل المتكرر — لن يحذف بياناتك
--
-- ⚠️ قاعدة SQL: schema.sql هو المصدر الرئيسي الوحيد.
--    أي تعديل SQL → هنا أولاً → ثم: npm run db:sync-schema
--    (يُحدّث migrations/*.sql و RUN-IN-SUPABASE.sql تلقائياً)
--
-- إذا أضفت العمود يدوياً وظهر تحذير schema cache:
--   انسخ القسم 1 فقط (من هنا حتى NOTIFY) والصقه وشغّله — يكفي
--   ثم: Supabase → Settings → API → Reload schema (إن استمر التحذير)
-- ════════════════════════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 1: إصلاح فوري — أعمدة الفروع + إعادة تحميل schema cache           │
-- │ يحل: unavailable_branch_ids + branches.email + تحذير schema cache        │
-- └──────────────────────────────────────────────────────────────────────────┘

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS unavailable_branch_ids JSONB DEFAULT '[]'::jsonb;

UPDATE public.cars
SET unavailable_branch_ids = '[]'::jsonb
WHERE unavailable_branch_ids IS NULL
   OR jsonb_typeof(unavailable_branch_ids) <> 'array';

ALTER TABLE public.cars
  ALTER COLUMN unavailable_branch_ids SET DEFAULT '[]'::jsonb;

ALTER TABLE public.cars
  ALTER COLUMN unavailable_branch_ids SET NOT NULL;

ALTER TABLE public.featured_offers
  ADD COLUMN IF NOT EXISTS disabled_branch_ids JSONB DEFAULT '[]'::jsonb;

UPDATE public.featured_offers
SET disabled_branch_ids = '[]'::jsonb
WHERE disabled_branch_ids IS NULL
   OR jsonb_typeof(disabled_branch_ids) <> 'array';

ALTER TABLE public.featured_offers
  ALTER COLUMN disabled_branch_ids SET DEFAULT '[]'::jsonb;

ALTER TABLE public.featured_offers
  ALTER COLUMN disabled_branch_ids SET NOT NULL;

ALTER TABLE public.featured_offers
  ADD COLUMN IF NOT EXISTS branch_ids JSONB DEFAULT '[]'::jsonb;

UPDATE public.featured_offers
SET branch_ids = '[]'::jsonb
WHERE branch_ids IS NULL
   OR jsonb_typeof(branch_ids) <> 'array';

ALTER TABLE public.featured_offers
  ALTER COLUMN branch_ids SET DEFAULT '[]'::jsonb;

ALTER TABLE public.featured_offers
  ALTER COLUMN branch_ids SET NOT NULL;

-- إصلاح سيارات أوقفت عالمياً بالخطأ
UPDATE public.cars
SET is_available = true
WHERE is_available = false
  AND jsonb_array_length(COALESCE(unavailable_branch_ids, '[]'::jsonb)) > 0;

-- بريد إلكتروني لكل فرع (لوحة الإدارة + إشعارات الحجز)
ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS branch_email TEXT DEFAULT NULL;

UPDATE public.branches
SET email = 'Yuadom14@gmail.com'
WHERE is_main = true AND (email IS NULL OR email = '');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cars'
      AND column_name = 'unavailable_branch_ids'
  ) THEN
    RAISE EXCEPTION 'فشل: عمود cars.unavailable_branch_ids غير موجود';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'branches'
      AND column_name = 'email'
  ) THEN
    RAISE EXCEPTION 'فشل: عمود branches.email غير موجود';
  END IF;

  RAISE NOTICE 'تم — branches.email + cars.unavailable_branch_ids جاهز. جاري reload schema cache...';
END $$;

-- مهم: يزيل تحذير schema cache بعد إضافة عمود جديد
NOTIFY pgrst, 'reload schema';

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 2: دوال مساعدة                                                    │
-- └──────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 3: الجداول الأساسية                                               │
-- └──────────────────────────────────────────────────────────────────────────┘

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
  unavailable_branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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
  branch_email TEXT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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
  disabled_branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT DEFAULT NULL,
  email TEXT DEFAULT NULL,
  hours TEXT DEFAULT 'السبت - الخميس: 8 ص - 12 م | الجمعة: 4 م - 12 م',
  map_url TEXT DEFAULT '#',
  image_url TEXT DEFAULT NULL,
  is_main BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 4: ترقية الجداول الموجودة (أعمدة قديمة)                           │
-- └──────────────────────────────────────────────────────────────────────────┘

ALTER TABLE cars ADD COLUMN IF NOT EXISTS offer JSONB DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_month NUMERIC(10,2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS car_class TEXT DEFAULT 'mid';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS unavailable_branch_ids JSONB DEFAULT '[]'::jsonb;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_offer_id TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_title TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rental_type TEXT DEFAULT 'daily';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_id UUID DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_name TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_city TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_phone TEXT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_email TEXT DEFAULT NULL;

ALTER TABLE branches ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL;

UPDATE public.branches
SET email = 'Yuadom14@gmail.com'
WHERE is_main = true AND (email IS NULL OR email = '');

ALTER TABLE featured_offers ADD COLUMN IF NOT EXISTS disabled_branch_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE featured_offers ADD COLUMN IF NOT EXISTS branch_ids JSONB DEFAULT '[]'::jsonb;

UPDATE cars SET unavailable_branch_ids = '[]'::jsonb
WHERE unavailable_branch_ids IS NULL OR jsonb_typeof(unavailable_branch_ids) <> 'array';

UPDATE featured_offers SET disabled_branch_ids = '[]'::jsonb
WHERE disabled_branch_ids IS NULL OR jsonb_typeof(disabled_branch_ids) <> 'array';

UPDATE featured_offers SET branch_ids = '[]'::jsonb
WHERE branch_ids IS NULL OR jsonb_typeof(branch_ids) <> 'array';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_branch_id_fkey' AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_branch_id_fkey
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 5: ترحيل البيانات القديمة                                          │
-- └──────────────────────────────────────────────────────────────────────────┘

UPDATE cars SET category = 'sedan' WHERE category = 'economy';
UPDATE cars SET category = 'suv'   WHERE category IN ('family', 'luxury');
UPDATE cars SET category = 'sedan' WHERE category = 'sports';
UPDATE cars SET category = 'van'   WHERE category = 'commercial';

UPDATE cars SET price_per_month = ROUND(price_per_day * 25, 2) WHERE price_per_month IS NULL;
ALTER TABLE cars ALTER COLUMN price_per_month SET DEFAULT 0;

UPDATE bookings SET rental_type = 'daily' WHERE rental_type IS NULL;
UPDATE cars SET car_class = 'mid' WHERE car_class IS NULL;

ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_category_check;
ALTER TABLE cars ADD CONSTRAINT cars_category_check
  CHECK (category IN ('sedan', 'hatchback', 'crossover', 'suv', 'van', 'pickup'));

ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_car_class_check;
ALTER TABLE cars ADD CONSTRAINT cars_car_class_check
  CHECK (car_class IN ('economy', 'mid', 'family', 'executive', 'luxury', 'sports'));

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 6: Triggers                                                         │
-- └──────────────────────────────────────────────────────────────────────────┘

DROP TRIGGER IF EXISTS cars_updated_at ON cars;
CREATE TRIGGER cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS featured_offers_updated_at ON featured_offers;
CREATE TRIGGER featured_offers_updated_at BEFORE UPDATE ON featured_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS branches_updated_at ON branches;
CREATE TRIGGER branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 7: توفر الحجز حسب الفرع                                            │
-- └──────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.get_booking_blocks(UUID);

CREATE OR REPLACE FUNCTION public.get_booking_blocks(
  p_car_id UUID DEFAULT NULL,
  p_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  car_id UUID,
  start_date DATE,
  end_date DATE,
  status TEXT,
  branch_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT b.id, b.car_id, b.start_date, b.end_date, b.status, b.branch_id
  FROM bookings b
  WHERE b.status IN ('pending', 'confirmed')
    AND (p_car_id IS NULL OR b.car_id = p_car_id)
    AND (p_branch_id IS NULL OR b.branch_id IS NULL OR b.branch_id = p_branch_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_blocks(UUID, UUID) TO anon, authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 8: Row Level Security                                               │
-- └──────────────────────────────────────────────────────────────────────────┘

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
CREATE POLICY "branches_public_read" ON branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "branches_public_insert" ON branches;
CREATE POLICY "branches_public_insert" ON branches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "branches_public_update" ON branches;
CREATE POLICY "branches_public_update" ON branches FOR UPDATE USING (true);

DROP POLICY IF EXISTS "branches_public_delete" ON branches;
CREATE POLICY "branches_public_delete" ON branches FOR DELETE USING (true);

DROP POLICY IF EXISTS "branches_admin_all" ON branches;
CREATE POLICY "branches_admin_all" ON branches
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 9: Storage (صور السيارات)                                          │
-- └──────────────────────────────────────────────────────────────────────────┘

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

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 10: بيانات تجريبية (فقط إذا جدول السيارات فاضي)                    │
-- └──────────────────────────────────────────────────────────────────────────┘

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

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 11: حسابات العملاء (تسجيل دخول بالإيميل وكلمة المرور)            │
-- │ الموقع + تطبيق Flutter — مجاني بدون Twilio أو SMS                       │
-- │                                                                          │
-- │ إعداد Supabase (يدوي — مرة واحدة بعد تحقق الدومين على Resend):          │
-- │ 1) Authentication → Providers → Email → Confirm email = ON               │
-- │ 2) Authentication → Email → SMTP Settings → Enable Custom SMTP:          │
-- │    Host smtp.resend.com | Port 465 | User resend | Pass = RESEND_API_KEY │
-- │    Sender: noreply@alkhodercar.com | Name: الخضر لتأجير السيارات        │
-- │ 3) Authentication → Email Templates → Confirm signup — الصق:             │
-- │    <h2>كود التحقق — الخضر لتأجير السيارات</h2>                           │
-- │    <p>كود التأكيد: <strong>{{ .Token }}</strong></p>                       │
-- │    <p>صالح لفترة محدودة. لا تشارك هذا الكود مع أحد.</p>                    │
-- │ 4) Authentication → URL Configuration → Site URL = https://alkhodercar.com │
-- │ 5) Authentication → Rate Limits — ارفع حد إرسال الإيميل إن لزم           │
-- └──────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  id_number TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
  v_name TEXT;
BEGIN
  v_phone := COALESCE(
    NULLIF(NEW.phone, ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  );
  v_name := NULLIF(NEW.raw_user_meta_data->>'full_name', '');

  INSERT INTO public.profiles (id, email, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    v_phone,
    v_name,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ترقية حساب الأدمن الحالي (yuadom880@gmail.com)
INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email, 'admin'
FROM auth.users u
WHERE lower(u.email) = lower('yuadom880@gmail.com')
ON CONFLICT (id) DO UPDATE
  SET role = 'admin', email = EXCLUDED.email, updated_at = now();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- رقم الجوال ليس فريداً بين العملاء (عائلة واحدة، أكثر من حساب) — التفاصيل تُحفظ في bookings.customer_phone
DROP INDEX IF EXISTS profiles_phone_customer_unique;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role = 'customer'
    AND NOT public.is_admin()
  );

DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- حجوزات: تسجيل دخول مطلوب — لا إدراج أو قراءة عامة للجميع
DROP POLICY IF EXISTS "bookings_public_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_public_select" ON bookings;

DROP POLICY IF EXISTS "bookings_customer_insert" ON bookings;
CREATE POLICY "bookings_customer_insert" ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'customer'
    )
  );

DROP POLICY IF EXISTS "bookings_customer_select" ON bookings;
CREATE POLICY "bookings_customer_select" ON bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "bookings_admin_select" ON bookings;
CREATE POLICY "bookings_admin_select" ON bookings
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "bookings_admin_update" ON bookings;
CREATE POLICY "bookings_admin_update" ON bookings
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "bookings_admin_delete" ON bookings;
CREATE POLICY "bookings_admin_delete" ON bookings
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- سيارات وعروض وفروع: صلاحيات الأدمن فقط (ليس كل authenticated)
DROP POLICY IF EXISTS "cars_admin_insert" ON cars;
CREATE POLICY "cars_admin_insert" ON cars
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "cars_admin_update" ON cars;
CREATE POLICY "cars_admin_update" ON cars
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "cars_admin_delete" ON cars;
CREATE POLICY "cars_admin_delete" ON cars
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "featured_offers_admin_all" ON featured_offers;
CREATE POLICY "featured_offers_admin_all" ON featured_offers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "branches_admin_all" ON branches;
CREATE POLICY "branches_admin_all" ON branches
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 12: حجوزاتي — فهرس استعلامات العميل (user_id)                     │
-- │ يُسرّع صفحة «حجوزاتي» في الموقع والتطبيق                                  │
-- └──────────────────────────────────────────────────────────────────────────┘

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_created
  ON public.bookings(user_id, created_at DESC);

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 13: أسعار السيارات حسب الفرع (وضع فرعي في الإدارة)                │
-- │ branch_prices: { "branch_uuid": { "price_per_day": 120, ... } }          │
-- │ الفروع بدون override تستخدم price_per_day / price_per_month العام        │
-- └──────────────────────────────────────────────────────────────────────────┘

ALTER TABLE cars ADD COLUMN IF NOT EXISTS branch_prices JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE cars
SET branch_prices = '{}'::jsonb
WHERE branch_prices IS NULL
   OR jsonb_typeof(branch_prices) <> 'object';

ALTER TABLE cars
  ALTER COLUMN branch_prices SET DEFAULT '{}'::jsonb;

ALTER TABLE cars
  ALTER COLUMN branch_prices SET NOT NULL;

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 13ب: أسماء السيارات حسب الفرع (وضع فرعي في الإدارة)               │
-- │ branch_names: { "branch_uuid": "اسم العرض في الفرع" }                   │
-- └──────────────────────────────────────────────────────────────────────────┘

ALTER TABLE cars ADD COLUMN IF NOT EXISTS branch_names JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE cars
SET branch_names = '{}'::jsonb
WHERE branch_names IS NULL
   OR jsonb_typeof(branch_names) <> 'object';

ALTER TABLE cars
  ALTER COLUMN branch_names SET DEFAULT '{}'::jsonb;

ALTER TABLE cars
  ALTER COLUMN branch_names SET NOT NULL;

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 14: حذف حساب العميل (Google Play — من داخل التطبيق)               │
-- │ يفصل الحجوزات (user_id → NULL) ثم يحذف auth.users + profiles (cascade)  │
-- └──────────────────────────────────────────────────────────────────────────┘

DROP FUNCTION IF EXISTS public.delete_customer_account();

CREATE OR REPLACE FUNCTION public.delete_customer_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF public.is_admin() THEN
    RAISE EXCEPTION 'admin_cannot_delete_via_app';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_uid AND role = 'customer'
  ) THEN
    RAISE EXCEPTION 'account_not_found';
  END IF;

  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_customer_account() TO authenticated;

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 15: Supabase Realtime — تحديث تلقائي (حجوزات أدمن / سيارات عميل)  │
-- └──────────────────────────────────────────────────────────────────────────┘

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

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ القسم 16: إعادة تحميل schema cache — مهم جداً بعد التشغيل               │
-- └──────────────────────────────────────────────────────────────────────────┘

NOTIFY pgrst, 'reload schema';

-- ════════════════════════════════════════════════════════════════════════════
-- نهاية الملف — الإصدار 4.7
-- ════════════════════════════════════════════════════════════════════════════