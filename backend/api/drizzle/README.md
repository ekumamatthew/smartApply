# Database Migrations (Neon/Postgres)

This folder contains SQL migrations for the backend API.

## Migrations

- `0001_better_auth_schema_reset.sql`
- `0002_email_history_and_cv.sql`
- `0003_cv_parsed_cache.sql`
- `0004_ai_usage_daily.sql`
- `0005_cv_optimization_templates.sql`
- `0006_cv_structured_json.sql`

## Run a migration

From `backend/api`:

```bash
DATABASE_URL=$(grep '^DATABASE_URL=' .env | head -n1 | cut -d= -f2- | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//')
psql "$DATABASE_URL" -f drizzle/0002_email_history_and_cv.sql
```

## Run all migrations manually (in order)

```bash
DATABASE_URL=$(grep '^DATABASE_URL=' .env | head -n1 | cut -d= -f2- | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//')
psql "$DATABASE_URL" -f drizzle/0001_better_auth_schema_reset.sql
psql "$DATABASE_URL" -f drizzle/0002_email_history_and_cv.sql
psql "$DATABASE_URL" -f drizzle/0003_cv_parsed_cache.sql
psql "$DATABASE_URL" -f drizzle/0004_ai_usage_daily.sql
psql "$DATABASE_URL" -f drizzle/0005_cv_optimization_templates.sql
psql "$DATABASE_URL" -f drizzle/0006_cv_structured_json.sql
```

## Verify tables were created

```bash
DATABASE_URL=$(grep '^DATABASE_URL=' .env | head -n1 | cut -d= -f2- | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//')
psql "$DATABASE_URL" -c '\\dt'
```

## Notes

- Do not `source .env` directly if values contain special shell characters (`&`, `?`, etc.).
- Keep migration files immutable after they are applied to shared environments.
- If a migration was already applied, rerunning it may fail with "already exists" errors.
