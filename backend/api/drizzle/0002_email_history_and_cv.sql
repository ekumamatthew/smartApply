CREATE TABLE "email_threads" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "jobDescription" text NOT NULL,
  "jobDescriptionHash" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "email_messages" (
  "id" text PRIMARY KEY NOT NULL,
  "threadId" text NOT NULL,
  "promptContext" text,
  "tone" text,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "keyHighlights" text[] NOT NULL DEFAULT '{}'::text[],
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "cv_documents" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "fileName" text NOT NULL,
  "storedPath" text NOT NULL,
  "mimeType" text NOT NULL,
  "sizeBytes" integer NOT NULL,
  "isDefault" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "email_threads"
  ADD CONSTRAINT "email_threads_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "email_messages"
  ADD CONSTRAINT "email_messages_threadId_email_threads_id_fk"
  FOREIGN KEY ("threadId") REFERENCES "public"."email_threads"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "cv_documents"
  ADD CONSTRAINT "cv_documents_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id")
  ON DELETE cascade ON UPDATE no action;

CREATE INDEX "email_threads_userId_idx" ON "email_threads" ("userId");
CREATE INDEX "email_threads_userId_jobDescriptionHash_idx" ON "email_threads" ("userId", "jobDescriptionHash");
CREATE INDEX "email_messages_threadId_idx" ON "email_messages" ("threadId");
CREATE INDEX "cv_documents_userId_idx" ON "cv_documents" ("userId");
CREATE INDEX "cv_documents_userId_isDefault_idx" ON "cv_documents" ("userId", "isDefault");
