-- ترحيل تصنيفات السيارات
-- نفّذ في Supabase SQL Editor

UPDATE cars SET category = 'sedan' WHERE category = 'economy';
UPDATE cars SET category = 'suv' WHERE category IN ('family', 'luxury');
UPDATE cars SET category = 'sedan' WHERE category = 'sports';

ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_category_check;

ALTER TABLE cars
  ADD CONSTRAINT cars_category_check
  CHECK (category IN ('sedan', 'hatchback', 'crossover', 'suv', 'van', 'pickup'));