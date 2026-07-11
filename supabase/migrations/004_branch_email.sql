-- بريد إلكتروني لكل فرع + حفظ بريد الفرع في الحجز
ALTER TABLE branches ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_email TEXT DEFAULT NULL;

UPDATE branches SET email = 'Yuadom14@gmail.com'
WHERE is_main = true AND (email IS NULL OR email = '');

NOTIFY pgrst, 'reload schema';