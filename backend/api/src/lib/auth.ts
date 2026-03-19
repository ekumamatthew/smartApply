import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const rawDatabaseUrl = process.env.DATABASE_URL?.trim();
const databaseUrl = rawDatabaseUrl?.replace(/^['"]|['"]$/g, '');

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is missing. Set it in backend/api/.env to your Neon Postgres URL.',
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET
    ? {
        reddit: {
          clientId: process.env.REDDIT_CLIENT_ID,
          clientSecret: process.env.REDDIT_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
    ? {
        twitter: {
          clientId: process.env.TWITTER_CLIENT_ID,
          clientSecret: process.env.TWITTER_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  basePath: '/api/auth',
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  emailAndPassword: { enabled: true },
  socialProviders,
});
