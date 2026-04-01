CREATE TABLE "ai_usage_daily" (
  "userId" text NOT NULL,
  "date" date NOT NULL,
  "parseCvCount" integer NOT NULL DEFAULT 0,
  "generateEmailCount" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "ai_usage_daily_userId_date_pk" PRIMARY KEY ("userId", "date")
);

ALTER TABLE "ai_usage_daily"
  ADD CONSTRAINT "ai_usage_daily_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id")
  ON DELETE cascade ON UPDATE no action;

CREATE INDEX "ai_usage_daily_userId_date_idx" ON "ai_usage_daily" ("userId", "date");
