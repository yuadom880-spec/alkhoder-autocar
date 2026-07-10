-- ترقية توفر الحجز حسب الفرع — آمن للتشغيل المتكرر
-- يشغّل تلقائياً عبر: npm run db:migrate

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
    AND (
      p_branch_id IS NULL
      OR b.branch_id IS NULL
      OR b.branch_id = p_branch_id
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_blocks(UUID, UUID) TO anon, authenticated;