-- أسماء مخصصة للسيارة حسب الفرع (للسيارات المشتركة بين الفروع)
-- branch_names: { "branch_uuid": "اسم العرض في الفرع" }

ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS branch_names JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.cars
SET branch_names = '{}'::jsonb
WHERE branch_names IS NULL
   OR jsonb_typeof(branch_names) <> 'object';

ALTER TABLE public.cars
  ALTER COLUMN branch_names SET DEFAULT '{}'::jsonb;

ALTER TABLE public.cars
  ALTER COLUMN branch_names SET NOT NULL;

NOTIFY pgrst, 'reload schema';