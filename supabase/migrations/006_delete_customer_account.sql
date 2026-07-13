-- حذف حساب العميل — مُستخرج تلقائياً من supabase/schema.sql (القسم 14)
-- المصدر الرئيسي: schema.sql — عدّل هناك ثم شغّل: npm run db:sync-schema

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

NOTIFY pgrst, 'reload schema';
