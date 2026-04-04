CREATE TABLE IF NOT EXISTS "user_profiles" (
  "userId" text PRIMARY KEY NOT NULL,
  phone text,
  linkedin text,
  "professionalSummary" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "user_profiles_userId_user_id_fk"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "user_notification_settings" (
  "userId" text PRIMARY KEY NOT NULL,
  "emailNotifications" boolean NOT NULL DEFAULT true,
  "applicationUpdates" boolean NOT NULL DEFAULT true,
  "interviewReminders" boolean NOT NULL DEFAULT true,
  "followUpReminders" boolean NOT NULL DEFAULT false,
  "weeklyReports" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "user_notification_settings_userId_user_id_fk"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "waitlist_subscribers" (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  source text NOT NULL DEFAULT 'web',
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "waitlist_subscribers_created_idx"
ON "waitlist_subscribers" ("createdAt" DESC);
