import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");
  
  console.log("Static files path:", distPath);
  console.log("dist/public exists:", fs.existsSync(distPath));
  console.log("index.html exists:", fs.existsSync(path.resolve(distPath, "index.html")));

  // Serve static files (JS, CSS, images, etc.)
  app.use("/*", serveStatic({ root: distPath }));

  // SPA fallback: serve index.html for any non-API route
  app.get("*", (c) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return c.text("Frontend build not found", 500);
    }
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
