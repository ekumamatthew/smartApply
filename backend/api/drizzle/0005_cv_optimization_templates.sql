CREATE TABLE IF NOT EXISTS "cv_templates" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "standard" text NOT NULL,
  "preview" text NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "cv_templates_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "cv_optimizations" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "cvId" text NOT NULL,
  "templateId" text NOT NULL,
  "standard" text NOT NULL,
  "jobDescription" text NOT NULL,
  "jobDescriptionHash" text NOT NULL,
  "requestedKeywords" text[] NOT NULL DEFAULT '{}',
  "extractedKeywords" text[] NOT NULL DEFAULT '{}',
  "optimizedCvText" text NOT NULL,
  "atsScore" integer NOT NULL DEFAULT 0,
  "recommendations" text[] NOT NULL DEFAULT '{}',
  "missingKeywords" text[] NOT NULL DEFAULT '{}',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "cv_optimizations_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade,
  CONSTRAINT "cv_optimizations_cvId_cv_documents_id_fk" FOREIGN KEY ("cvId") REFERENCES "cv_documents"("id") ON DELETE cascade,
  CONSTRAINT "cv_optimizations_templateId_cv_templates_id_fk" FOREIGN KEY ("templateId") REFERENCES "cv_templates"("id") ON DELETE restrict
);

CREATE INDEX IF NOT EXISTS "cv_optimizations_user_cv_created_idx"
ON "cv_optimizations" ("userId", "cvId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "cv_optimizations_user_hash_idx"
ON "cv_optimizations" ("userId", "jobDescriptionHash");

INSERT INTO "cv_templates" ("id", "slug", "name", "description", "standard", "preview", "sortOrder")
VALUES
  ('tpl_01', 'ats-classic', 'ATS Classic', 'Simple one-column ATS-safe structure with clean section headings.', 'ats', 'One-column, keyword-forward, ATS parser friendly.', 1),
  ('tpl_02', 'ats-compact', 'ATS Compact', 'Dense ATS layout for experienced candidates with strong bullets.', 'ats', 'Compact sections and quantified impact bullets.', 2),
  ('tpl_03', 'ats-tech', 'ATS Tech', 'ATS variant designed for software and data roles.', 'ats', 'Emphasis on stack, projects, and measurable outcomes.', 3),
  ('tpl_04', 'modern-minimal', 'Modern Minimal', 'Balanced modern layout with readability-focused spacing.', 'modern', 'Minimal visual noise, elegant section rhythm.', 4),
  ('tpl_05', 'modern-performance', 'Modern Performance', 'Modern layout highlighting achievements and KPIs.', 'modern', 'Achievement-first format with impact emphasis.', 5),
  ('tpl_06', 'modern-creative', 'Modern Creative', 'Modern profile-oriented layout for product, design, and marketing.', 'modern', 'Narrative summary plus capability blocks.', 6),
  ('tpl_07', 'executive-brief', 'Executive Brief', 'Senior-level concise format for leadership roles.', 'executive', 'Leadership scope, transformation outcomes, board-ready tone.', 7),
  ('tpl_08', 'executive-growth', 'Executive Growth', 'Executive format tuned for growth and revenue leadership.', 'executive', 'Revenue, expansion, and P&L signal-focused sections.', 8),
  ('tpl_09', 'academic-research', 'Academic Research', 'Structured profile for research/teaching applicants.', 'academic', 'Publications, research projects, and teaching blocks.', 9),
  ('tpl_10', 'general-purpose', 'General Purpose', 'Flexible multi-industry template for broad applications.', 'general', 'Well-rounded structure suitable for most roles.', 10)
ON CONFLICT ("id") DO UPDATE
SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "standard" = EXCLUDED."standard",
  "preview" = EXCLUDED."preview",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = now();
