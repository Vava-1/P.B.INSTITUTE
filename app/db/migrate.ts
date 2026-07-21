import { getDb } from "../api/queries/connection";

/**
 * Raw SQL migrations — runs on every container startup BEFORE the seed.
 * These use ALTER TABLE with try/catch (MySQL doesn't support IF NOT EXISTS
 * for columns in all versions). Safe to run repeatedly — errors for existing
 * columns are silently ignored.
 *
 * This is more reliable than `drizzle-kit push` for adding columns on
 * PlanetScale/MySQL, which sometimes skips new columns in non-interactive mode.
 */
export async function runMigrations() {
  const db = getDb();
  const migrations: Array<{ name: string; sql: string }> = [
    {
      name: "testimonials.linkedin_url",
      sql: "ALTER TABLE testimonials ADD COLUMN linkedin_url text",
    },
    {
      name: "testimonials.photo_url_mediumtext",
      // Change photo_url from TEXT (65KB) to MEDIUMTEXT (16MB) so it can hold
      // base64-encoded uploaded images.
      sql: "ALTER TABLE testimonials MODIFY COLUMN photo_url mediumtext",
    },
    {
      name: "testimonials.course_id_type_fix",
      sql: "ALTER TABLE testimonials MODIFY COLUMN course_id int",
    },
    {
      name: "enrollments.course_id_type_fix",
      sql: "ALTER TABLE enrollments MODIFY COLUMN course_id int",
    },
    {
      name: "certificates.enrollment_id_type_fix",
      sql: "ALTER TABLE certificates MODIFY COLUMN enrollment_id int",
    },
    {
      name: "payments.admin_notes",
      sql: "ALTER TABLE payments ADD COLUMN admin_notes text",
    },
  ];

  for (const migration of migrations) {
    try {
      await db.execute(migration.sql);
      console.log(`✅ [migration] ${migration.name} — applied`);
    } catch (e: any) {
      // "Duplicate column name" or "Check that column/data type exists" = already applied.
      const msg = e.message || "";
      if (msg.includes("Duplicate column") || msg.includes("already exists") || msg.includes("DATA_TYPE")) {
        // Already applied — skip silently.
      } else {
        console.warn(`⚠️  [migration] ${migration.name} — skipped:`, msg.slice(0, 120));
      }
    }
  }
}
