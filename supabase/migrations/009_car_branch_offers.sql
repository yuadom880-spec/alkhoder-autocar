-- عروض السيارة حسب الفرع (يومي/شهري لفرع واحد)
-- branch_offers: { "branch_uuid": { "daily": {...}, "monthly": {...} } }

ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS branch_offers JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.cars
SET branch_offers = '{}'::jsonb
WHERE branch_offers IS NULL
   OR jsonb_typeof(branch_offers) <> 'object';

ALTER TABLE public.cars
  ALTER COLUMN branch_offers SET DEFAULT '{}'::jsonb;

ALTER TABLE public.cars
  ALTER COLUMN branch_offers SET NOT NULL;

NOTIFY pgrst, 'reload schema';