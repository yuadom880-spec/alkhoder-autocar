-- إيقاف العروض اليدوية لفرع محدد فقط
ALTER TABLE featured_offers
  ADD COLUMN IF NOT EXISTS disabled_branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb;