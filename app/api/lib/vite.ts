import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import { stat } from "fs/promises";

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
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

// Long-cache hashed Vite assets, never cache index.html.
function cacheControlFor(ext: string): string {
  if (ext === '.html') return 'no-cache, no-store, must-revalidate';
  // Vite emits content-hashed filenames for JS/CSS/images, so they can be cached aggressively.
  if (['.js', '.mjs', '.css', '.woff', '.woff2', '.ttf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif'].includes(ext)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=3600';
}

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  if (!fs.existsSync(distPath)) {
    console.error("ERROR: dist/public not found! Did the build run?");
    return;
  }

  app.use("*", async (c, next) => {
    const url = new URL(c.req.url);
    const pathname = decodeURIComponent(url.pathname);

    let filePath = path.join(distPath, pathname);

    // SPA fallback: non-existent paths serve index.html (so client-side routing works).
    try {
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch {
      filePath = path.join(distPath, 'index.html');
    }

    try {
      const stats = await stat(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Use ETag based on mtime+size for conditional requests.
      const etag = `"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;
      if (c.req.header('if-none-match') === etag) {
        return new Response(null, { status: 304 });
      }

      // STREAM the file (was fs.readFileSync — blocked the event loop on every request).
      const stream = createReadStream(filePath);
      const readable = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)));
          stream.on('end', () => controller.close());
          stream.on('error', (err) => controller.error(err));
        },
        cancel() {
          stream.destroy();
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': stats.size.toString(),
          'Cache-Control': cacheControlFor(ext),
          'ETag': etag,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
        },
      });
    } catch {
      return next();
    }
  });
}
