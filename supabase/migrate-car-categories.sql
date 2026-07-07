-- ترحيل تصنيفات السيارات إلى الفئات الجديدة
-- نفّذ في Supabase SQL Editor بعد التحديث

UPDATE cars SET category = 'sedan' WHERE category = 'economy';
UPDATE cars SET category = 'family' WHERE category = 'van';

ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_category_check;

ALTER TABLE cars
  ADD CONSTRAINT cars_category_check
  CHECK (category IN ('sedan', 'crossover', 'suv', 'family', 'pickup', 'van', 'sports', 'luxury'));