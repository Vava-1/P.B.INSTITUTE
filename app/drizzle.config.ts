import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
  // verbose: true logs every SQL statement during push/migrate.
  verbose: true,
  // strict: true would require interactive confirmation for destructive changes;
  // we disable it so non-interactive `drizzle-kit push --force` works in CI/CD.
  strict: false,
});
