-- إزالة قيد فريدية رقم الجوال على profiles — كان يمنع الحجز إذا الرقم مسجّل لحساب آخر
-- رقم الجوال يُحفظ دائماً في bookings.customer_phone
DROP INDEX IF EXISTS profiles_phone_customer_unique;