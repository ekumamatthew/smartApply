ALTER TABLE "cv_documents"
  ADD COLUMN "parsedCvJson" jsonb,
  ADD COLUMN "parsedCvUpdatedAt" timestamp;
