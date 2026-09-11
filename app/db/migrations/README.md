# Database Migrations

This directory is managed by Drizzle ORM's migration pipeline. All schema
changes MUST go through `drizzle-kit generate` — never hand-write SQL files in
this directory.

## Commands

```bash
# After editing db/schema.ts:
npm run db:generate

# Review the generated SQL and commit it:
git diff db/migrations/

# Apply migrations against the target branch's DB
# (run manually in staging first, then production):
npm run db:migrate
```

## What's in here

- `*.sql` — hand-verifiable, generated idempotent migration files.
- `meta/` — Drizzle's journal + snapshot state. Keep it committed; it is the
  source of truth for "has 0001 already been applied?".

## CI / Deploy policy

1. Commit the generated migration together with the schema change.
2. In Railway, add `npm run db:migrate` as a pre-deploy step, or run it
   manually after deploy. Do not run `drizzle-kit push` in production.
3. If a migration needs to be edited after it has been applied anywhere, do
   NOT rewrite the committed file. Generate and commit a new one that repairs
   the state.

## Lockfile of historical migrations

| Migration | Description |
| --------- | ----------- |
| `0000_unique_polaris.sql` | Baseline: initial schema snapshot (13 tables). No comment folder contents. |