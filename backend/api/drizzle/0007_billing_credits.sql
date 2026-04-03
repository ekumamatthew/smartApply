CREATE TABLE IF NOT EXISTS "user_credits" (
  "userId" text PRIMARY KEY NOT NULL,
  "balance" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "user_credits_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "credit_ledger" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "kind" text NOT NULL,
  "amount" integer NOT NULL,
  "balanceAfter" integer NOT NULL,
  "reason" text,
  "meta" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "credit_ledger_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "credit_ledger_user_created_idx"
ON "credit_ledger" ("userId", "createdAt" DESC);

CREATE TABLE IF NOT EXISTS "credit_orders" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "amountUsdCents" integer NOT NULL,
  "credits" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "provider" text NOT NULL DEFAULT 'stripe',
  "providerSessionId" text,
  "providerPaymentId" text,
  "creditedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "credit_orders_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "credit_orders_user_created_idx"
ON "credit_orders" ("userId", "createdAt" DESC);
