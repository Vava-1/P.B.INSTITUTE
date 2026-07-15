import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./auth/auth";
import { Paths } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { courses, newsEvents, payments } from "@db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { buildMomoConfig, checkTransactionStatus } from "./lib/mtn-momo";

const app = new Hono<{ Bindings: HttpBindings }>();

// SECURITY: 5 MB allows for base64-encoded photos in testimonials/news.
// Was 50 MB (too large), then 1 MB (too small for base64 images).
app.use(bodyLimit({ maxSize: 5 * 1024 * 1024 }));

// SECURITY: security headers (X-Content-Type-Options, X-Frame-Options, CSP-lite, etc.)
app.use("*", secureHeaders());

// SECURITY: CORS allowlist. The SPA is same-origin, so we only allow the
// configured OPEN_URL (used by the OAuth IdP for cross-origin calls if needed).
if (env.openUrl) {
  app.use(
    "/api/*",
    cors({
      origin: [env.openUrl],
      credentials: true,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "x-admin-token", "x-trpc-source"],
    }),
  );
}

// Cache control for public API responses
app.use("/api/trpc/public.settings.*", async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
});
app.use("/api/trpc/public.courses.*", async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=30");
});

// HEALTH: actually probe the DB instead of fire-and-forget.
app.get("/health", async (c) => {
  try {
    const db = getDb();
    await db.execute("SELECT 1");
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: "connected",
      version: process.env.npm_package_version ?? "unknown",
    });
  } catch (e) {
    return c.json(
      { status: "error", db: "disconnected", error: (e as Error).message },
      503,
    );
  }
});

// Diagnostic endpoint — shows table counts and can trigger a re-seed.
app.get("/api/diag", async (c) => {
  const db = getDb();
  const result: any = {};
  try {
    const [tc] = await db.execute("SELECT COUNT(*) as cnt FROM testimonials") as any;
    result.testimonials_count = tc?.cnt ?? tc?.[0]?.cnt ?? "?";
  } catch (e: any) {
    result.testimonials_count_error = e.message;
  }
  try {
    // Try selecting all columns the Drizzle query uses — if any column is missing, this fails.
    const [rows] = await db.execute("SELECT id, student_name, photo_url, linkedin_url, course_id, course_name, completion_year, current_role, employer, quote, rating, is_featured, is_approved, is_published, submitted_at, updated_at FROM testimonials WHERE is_published = true AND is_approved = true LIMIT 3") as any;
    result.testimonials_query = Array.isArray(rows) ? rows : [rows];
    result.testimonials_query_count = (Array.isArray(rows) ? rows : [rows]).length;
  } catch (e: any) {
    result.testimonials_query_error = e.message;
  }
  try {
    // Show the actual column names in the testimonials table.
    const [cols] = await db.execute("SHOW COLUMNS FROM testimonials") as any;
    result.testimonials_columns = (Array.isArray(cols) ? cols : [cols]).map((r: any) => r.Field);
  } catch (e: any) {
    result.testimonials_columns_error = e.message;
  }
  return c.json(result);
});

// Manual re-seed trigger — calls seedIfEmpty and returns the result.
app.post("/api/reseed", async (c) => {
  try {
    const { seedIfEmpty } = await import("../db/seed-if-empty");
    await seedIfEmpty();
    const db = getDb();
    const [tc] = await db.execute("SELECT COUNT(*) as cnt FROM testimonials") as any;
    return c.json({ success: true, testimonials_count: tc?.cnt ?? tc?.[0]?.cnt ?? "?" });
  } catch (e) {
    return c.json({ error: (e as Error).message, stack: (e as Error).stack }, 500);
  }
});

app.get("/sitemap.xml", async (c) => {
  try {
    const db = getDb();
    const [courseList, newsList] = await Promise.all([
      db.select({ slug: courses.slug, updatedAt: courses.updatedAt }).from(courses).where(eq(courses.isPublished, true)),
      db.select({ slug: newsEvents.slug, publishedAt: newsEvents.publishedAt }).from(newsEvents).where(eq(newsEvents.isPublished, true)),
    ]);

    const urls = [
      ...courseList.map(c => `<url><loc>https://pacemakerinstitute.ac.rw/courses/${c.slug}</loc><lastmod>${c.updatedAt.toISOString().split("T")[0]}</lastmod><priority>0.9</priority></url>`),
      ...newsList.map(n => `<url><loc>https://pacemakerinstitute.ac.rw/news/${n.slug}</loc><lastmod>${n.publishedAt?.toISOString().split("T")[0] ?? ""}</lastmod><priority>0.7</priority></url>`),
    ];

    return c.text(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
      200,
      { "Content-Type": "application/xml" }
    );
  } catch {
    return c.text(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      200,
      { "Content-Type": "application/xml" }
    );
  }
});

app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// MTN MoMo webhook — MTN calls this when a requestToPay completes.
// Idempotent: safe to receive the same notification multiple times.
app.post("/api/momo/webhook", async (c) => {
  try {
    const body = (await c.req.json().catch(() => null)) as any;
    if (!body || !body.referenceId) {
      return c.json({ status: "ignored", reason: "no referenceId" }, 200);
    }
    const db = getDb();
    // Find the local payment row by MTN's referenceId (stored as transactionId).
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, body.referenceId))
      .then(r => r[0] ?? null);
    if (!payment) {
      // Not our payment — acknowledge so MTN doesn't retry.
      return c.json({ status: "ignored", reason: "unknown reference" }, 200);
    }
    // Only update if still pending — idempotent.
    if (payment.status !== "pending") {
      return c.json({ status: "ok", reason: "already finalized" }, 200);
    }
    const momoConfig = buildMomoConfig();
    if (!momoConfig) {
      return c.json({ status: "error", reason: "momo not configured" }, 500);
    }
    // Verify with MTN before trusting the webhook body.
    const { status: mtnStatus } = await checkTransactionStatus(momoConfig, body.referenceId);
    if (mtnStatus === "SUCCESSFUL") {
      await db
        .update(payments)
        .set({ status: "success", verifiedAt: new Date() })
        .where(eq(payments.id, payment.id));
    } else if (mtnStatus === "FAILED" || mtnStatus === "CANCELLED") {
      await db
        .update(payments)
        .set({ status: mtnStatus === "CANCELLED" ? "cancelled" : "failed" })
        .where(eq(payments.id, payment.id));
    }
    return c.json({ status: "ok" }, 200);
  } catch (e) {
    console.error("[momo webhook] error:", e);
    // Return 500 so MTN retries.
    return c.json({ status: "error" }, 500);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// ─── Production server ───
let server: { close: (cb?: () => void) => void } | null = null;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  server = serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);

    // AUTO-MIGRATE + AUTO-SEED: after the server starts, run raw SQL migrations
    // to add any missing columns (drizzle-kit push sometimes skips new columns),
    // then check if any tables are empty and re-insert seed data if needed.
    // Both run in the background — doesn't block startup.
    (async () => {
      try {
        const { runMigrations } = await import("../db/migrate");
        await runMigrations();
      } catch (e) {
        console.error("[auto-migrate] failed:", e);
      }
      try {
        const { seedIfEmpty } = await import("../db/seed-if-empty");
        await seedIfEmpty();
      } catch (e) {
        console.error("[auto-seed] failed:", e);
      }
    })();
  });

  // GRACEFUL SHUTDOWN: drain in-flight requests and close the DB pool on SIGTERM/SIGINT.
  // Railway sends SIGTERM when redeploying.
  const shutdown = (signal: string) => {
    console.log(`[shutdown] received ${signal}, draining...`);
    if (server) {
      server.close(() => {
        console.log("[shutdown] HTTP server closed.");
        process.exit(0);
      });
      // Force-exit after 10s if drain stalls.
      setTimeout(() => {
        console.warn("[shutdown] forcing exit after timeout.");
        process.exit(1);
      }, 10_000).unref();
    } else {
      process.exit(0);
    }
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
