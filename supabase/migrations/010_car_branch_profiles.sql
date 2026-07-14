-- ملف السيارة الكامل لكل فرع (اسم، صور، وصف، أسعار، عروض…)
-- branch_profiles: { "branch_uuid": { "name": "...", "images": [...], "offer": {...} } }

ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS branch_profiles JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.cars
SET branch_profiles = '{}'::jsonb
WHERE branch_profiles IS NULL
   OR jsonb_typeof(branch_profiles) <> 'object';

ALTER TABLE public.cars
  ALTER COLUMN branch_profiles SET DEFAULT '{}'::jsonb;

ALTER TABLE public.cars
  ALTER COLUMN branch_profiles SET NOT NULL;

NOTIFY pgrst, 'reload schema';