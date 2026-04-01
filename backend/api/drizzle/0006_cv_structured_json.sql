ALTER TABLE "cv_optimizations"
ADD COLUMN IF NOT EXISTS "structuredCvJson" jsonb;
