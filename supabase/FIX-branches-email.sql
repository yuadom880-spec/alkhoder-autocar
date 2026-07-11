-- إصلاح فوري: Could not find the 'email' column of 'branches'
-- انسخ والصق في Supabase → SQL Editor → Run

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS branch_email TEXT DEFAULT NULL;

UPDATE public.branches
SET email = 'Yuadom14@gmail.com'
WHERE is_main = true AND (email IS NULL OR email = '');

NOTIFY pgrst, 'reload schema';