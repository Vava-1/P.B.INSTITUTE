// Simple in-memory rate limiter with TTL eviction.
// For multi-instance deployments, replace with a Redis-backed limiter.
const counters = new Map<string, { count: number; resetAt: number }>();

// Periodically evict expired entries to prevent memory growth.
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 min

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of counters) {
    if (entry.resetAt < now) counters.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const entry = counters.get(key);

  if (!entry || entry.resetAt < now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

// For test resets.
export function _resetRateLimiter() {
  counters.clear();
}
