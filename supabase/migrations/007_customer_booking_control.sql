-- صلاحيات العميل: إلغاء حجوزاته أو حذفها من قائمته
-- شغّل هذا الملف في Supabase → SQL Editor

-- ─── RLS: تحديث (إلغاء) ─────────────────────────────────────
DROP POLICY IF EXISTS "bookings_customer_update_own" ON public.bookings;
CREATE POLICY "bookings_customer_update_own" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'cancelled'
  );

-- ─── RLS: حذف (منتهية / ملغاة / مرفوضة) ─────────────────────
DROP POLICY IF EXISTS "bookings_customer_delete_own" ON public.bookings;
CREATE POLICY "bookings_customer_delete_own" ON public.bookings
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('cancelled', 'rejected', 'completed')
  );

-- ─── RPC: إلغاء آمن ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cancel_my_booking(p_booking_id uuid)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.bookings;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'must_be_signed_in';
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_booking_id
    AND user_id = auth.uid()
    AND status IN ('pending', 'confirmed')
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'cannot_cancel_booking';
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_my_booking(uuid) TO authenticated;

-- ─── RPC: حذف من القائمة ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_my_booking(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'must_be_signed_in';
  END IF;

  DELETE FROM public.bookings
  WHERE id = p_booking_id
    AND user_id = auth.uid()
    AND status IN ('cancelled', 'rejected', 'completed');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted = 0 THEN
    RAISE EXCEPTION 'cannot_delete_booking';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_my_booking(uuid) TO authenticated;
