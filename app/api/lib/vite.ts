import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
};

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");
  
  console.log("Static files path:", distPath);
  console.log("dist/public exists:", fs.existsSync(distPath));
  
  if (!fs.existsSync(distPath)) {
    console.error("ERROR: dist/public not found!");
    return;
  }

  // Serve static files and SPA fallback
  app.use("*", async (c, next) => {
    const url = new URL(c.req.url);
    let filePath = path.join(distPath, decodeURIComponent(url.pathname));
    
    // Default to index.html for root or non-existent paths
    if (url.pathname === '/' || !fs.existsSync(filePath)) {
      filePath = path.join(distPath, 'index.html');
    }
    
    // If it's a directory, try index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    
    if (!fs.existsSync(filePath)) {
      return next();
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    
    return new Response(content, {
      headers: { 'Content-Type': contentType },
    });
  });
}
