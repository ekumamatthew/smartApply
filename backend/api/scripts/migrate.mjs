import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

function readEnvFileValue(key) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return null;

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq).trim();
    if (k !== key) continue;
    const raw = trimmed.slice(eq + 1).trim();
    return raw.replace(/^['"]|['"]$/g, '');
  }
  return null;
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT to_regclass($1) AS reg`,
    [`public.${tableName}`],
  );
  return Boolean(result.rows[0]?.reg);
}

async function columnExists(client, tableName, columnName) {
  const result = await client.query(
    `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    LIMIT 1
    `,
    [tableName, columnName],
  );
  return result.rowCount > 0;
}

async function isAppliedBySchema(client, tag) {
  if (tag === '0001_better_auth_schema_reset') {
    return (
      (await tableExists(client, 'user')) &&
      (await tableExists(client, 'account')) &&
      (await tableExists(client, 'session')) &&
      (await tableExists(client, 'verification')) &&
      (await columnExists(client, 'user', 'emailVerified'))
    );
  }

  if (tag === '0002_email_history_and_cv') {
    return (
      (await tableExists(client, 'email_threads')) &&
      (await tableExists(client, 'email_messages')) &&
      (await tableExists(client, 'cv_documents'))
    );
  }

  if (tag === '0003_cv_parsed_cache') {
    return (
      (await columnExists(client, 'cv_documents', 'parsedCvJson')) &&
      (await columnExists(client, 'cv_documents', 'parsedCvUpdatedAt'))
    );
  }

  if (tag === '0004_ai_usage_daily') {
    return await tableExists(client, 'ai_usage_daily');
  }

  if (tag === '0005_cv_optimization_templates') {
    return (
      (await tableExists(client, 'cv_templates')) &&
      (await tableExists(client, 'cv_optimizations'))
    );
  }

  if (tag === '0006_cv_structured_json') {
    return await columnExists(client, 'cv_optimizations', 'structuredCvJson');
  }

  return false;
}

async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "smartapply_sql_migrations" (
      "tag" text PRIMARY KEY NOT NULL,
      "appliedAt" timestamp NOT NULL DEFAULT now()
    )
  `);
}

async function loadAppliedTags(client) {
  const result = await client.query(
    'SELECT "tag" FROM "smartapply_sql_migrations" ORDER BY "appliedAt" ASC',
  );
  return new Set(result.rows.map((row) => String(row.tag)));
}

async function markApplied(client, tag) {
  await client.query(
    `
    INSERT INTO "smartapply_sql_migrations" ("tag", "appliedAt")
    VALUES ($1, NOW())
    ON CONFLICT ("tag") DO NOTHING
    `,
    [tag],
  );
}

function getMigrationOrder() {
  return [
    '0001_better_auth_schema_reset',
    '0002_email_history_and_cv',
    '0003_cv_parsed_cache',
    '0004_ai_usage_daily',
    '0005_cv_optimization_templates',
    '0006_cv_structured_json',
  ];
}

async function run() {
  const url = process.env.DATABASE_URL || readEnvFileValue('DATABASE_URL');
  if (!url) {
    console.error(
      '[db:migrate] DATABASE_URL is missing. Set it in env or backend/api/.env',
    );
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await ensureTrackingTable(client);
    const appliedTags = await loadAppliedTags(client);
    const migrationsDir = path.resolve(process.cwd(), 'drizzle');

    for (const tag of getMigrationOrder()) {
      if (appliedTags.has(tag)) continue;

      const alreadyApplied = await isAppliedBySchema(client, tag);
      if (alreadyApplied) {
        await markApplied(client, tag);
        console.log(`[db:migrate] Baseline marked: ${tag}`);
        continue;
      }

      const filePath = path.join(migrationsDir, `${tag}.sql`);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found: ${filePath}`);
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await markApplied(client, tag);
        await client.query('COMMIT');
        console.log(`[db:migrate] Applied: ${tag}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('[db:migrate] Migration check complete');
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('[db:migrate] Failed', error);
  process.exit(1);
});
