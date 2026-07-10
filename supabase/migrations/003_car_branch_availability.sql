-- توفر السيارة حسب الفرع — آمن للتشغيل المتكرر
ALTER TABLE cars
  ADD COLUMN IF NOT EXISTS unavailable_branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb;