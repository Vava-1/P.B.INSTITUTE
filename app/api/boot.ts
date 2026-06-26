import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./auth/auth";
import { Paths } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { courses, newsEvents } from "@db/schema";
import { eq, asc, desc } from "drizzle-orm";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Cache control for public API responses
app.use("/api/trpc/public.settings.*", async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
});
app.use("/api/trpc/public.courses.*", async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=30");
});

app.get("/health", (c) => {
  try {
    const db = getDb();
    db.execute("SELECT 1").catch(() => {});
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: "connected",
      version: process.env.npm_package_version ?? "unknown",
    });
  } catch (e) {
    return c.json({ status: "error", db: "disconnected", error: (e as Error).message }, 503);
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

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}
