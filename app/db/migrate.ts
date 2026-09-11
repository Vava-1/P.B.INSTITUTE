import { getDb } from "../api/queries/connection";

/**
 * Legacy raw-SQL migration runner — previously called on every container
 * startup to patch schema drift via direct ALTER TABLE statements.
 *
 * P1-7 requires that ALL schema changes go through the drizzle-kit pipeline.
 * This function is now a no-op; kept for backwards compatibility with
 * api/boot.ts's startup sequence.
 *
 * Going forward:
 *   - Edit db/schema.ts, then `npm run db:generate`, review, commit,
 *     then `npm run db:migrate:prod` in CI/deploy.
 *   - Never write ALTER TABLE in a hotfix commit.
 */
export async function runMigrations(): Promise<void> {
  const db = getDb();
  void db;
  return;
}