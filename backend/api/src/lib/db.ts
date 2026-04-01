import 'dotenv/config';
import { Pool } from 'pg';

const rawDatabaseUrl = process.env.DATABASE_URL?.trim();
const databaseUrl = rawDatabaseUrl?.replace(/^['"]|['"]$/g, '');

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is missing. Set it in backend/api/.env to your Neon Postgres URL.',
  );
}

export const dbPool = new Pool({
  connectionString: databaseUrl,
});
