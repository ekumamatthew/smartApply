import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// ----- Users -----
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- Accounts (OAuth) -----
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- Sessions -----
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

// ----- Verification -----
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- Email Threads -----
export const emailThread = pgTable('email_threads', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  jobDescription: text('jobDescription').notNull(),
  jobDescriptionHash: text('jobDescriptionHash').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- Email Messages -----
export const emailMessage = pgTable('email_messages', {
  id: text('id').primaryKey(),
  threadId: text('threadId')
    .notNull()
    .references(() => emailThread.id, { onDelete: 'cascade' }),
  promptContext: text('promptContext'),
  tone: text('tone'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  keyHighlights: text('keyHighlights').array().notNull().default([]),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// ----- Uploaded CV Documents -----
export const cvDocument = pgTable('cv_documents', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  fileName: text('fileName').notNull(),
  storedPath: text('storedPath').notNull(),
  mimeType: text('mimeType').notNull(),
  sizeBytes: integer('sizeBytes').notNull(),
  isDefault: boolean('isDefault').notNull().default(false),
  parsedCvJson: jsonb('parsedCvJson'),
  parsedCvUpdatedAt: timestamp('parsedCvUpdatedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- CV Templates -----
export const cvTemplate = pgTable('cv_templates', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  standard: text('standard').notNull(),
  preview: text('preview').notNull(),
  sortOrder: integer('sortOrder').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- CV Optimization History -----
export const cvOptimization = pgTable('cv_optimizations', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  cvId: text('cvId')
    .notNull()
    .references(() => cvDocument.id, { onDelete: 'cascade' }),
  templateId: text('templateId')
    .notNull()
    .references(() => cvTemplate.id, { onDelete: 'restrict' }),
  standard: text('standard').notNull(),
  jobDescription: text('jobDescription').notNull(),
  jobDescriptionHash: text('jobDescriptionHash').notNull(),
  requestedKeywords: text('requestedKeywords').array().notNull().default([]),
  extractedKeywords: text('extractedKeywords').array().notNull().default([]),
  structuredCvJson: jsonb('structuredCvJson'),
  optimizedCvText: text('optimizedCvText').notNull(),
  atsScore: integer('atsScore').notNull().default(0),
  recommendations: text('recommendations').array().notNull().default([]),
  missingKeywords: text('missingKeywords').array().notNull().default([]),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- AI Usage Quotas -----
export const aiUsageDaily = pgTable('ai_usage_daily', {
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  parseCvCount: integer('parseCvCount').notNull().default(0),
  generateEmailCount: integer('generateEmailCount').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- User Credits -----
export const userCredits = pgTable('user_credits', {
  userId: text('userId')
    .notNull()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  balance: integer('balance').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- Credit Ledger -----
export const creditLedger = pgTable('credit_ledger', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  amount: integer('amount').notNull(),
  balanceAfter: integer('balanceAfter').notNull(),
  reason: text('reason'),
  meta: jsonb('meta'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// ----- Credit Orders -----
export const creditOrder = pgTable('credit_orders', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  amountUsdCents: integer('amountUsdCents').notNull(),
  credits: integer('credits').notNull(),
  status: text('status').notNull().default('pending'),
  provider: text('provider').notNull().default('flutterwave'),
  providerSessionId: text('providerSessionId'),
  providerPaymentId: text('providerPaymentId'),
  creditedAt: timestamp('creditedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- User Profile -----
export const userProfile = pgTable('user_profiles', {
  userId: text('userId')
    .notNull()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  phone: text('phone'),
  linkedin: text('linkedin'),
  professionalSummary: text('professionalSummary'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- User Notification Settings -----
export const userNotificationSettings = pgTable('user_notification_settings', {
  userId: text('userId')
    .notNull()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  emailNotifications: boolean('emailNotifications').notNull().default(true),
  applicationUpdates: boolean('applicationUpdates').notNull().default(true),
  interviewReminders: boolean('interviewReminders').notNull().default(true),
  followUpReminders: boolean('followUpReminders').notNull().default(false),
  weeklyReports: boolean('weeklyReports').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ----- Waitlist Subscribers -----
export const waitlistSubscriber = pgTable('waitlist_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  source: text('source').notNull().default('web'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// ----- Contact Submissions -----
export const contactSubmission = pgTable('contact_submissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  category: text('category'),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
