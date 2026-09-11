import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, _resetRateLimiter } from "../lib/rate-limiter";

describe("in-memory rate limiter", () => {
  beforeEach(() => {
    _resetRateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    _resetRateLimiter();
  });

  it("allows requests up to the limit within a window", () => {
    expect(rateLimit("ip:1", 3, 60_000)).toBe(true);
    expect(rateLimit("ip:1", 3, 60_000)).toBe(true);
    expect(rateLimit("ip:1", 3, 60_000)).toBe(true);
  });

  it("rejects once the limit is exceeded", () => {
    rateLimit("ip:1", 3, 60_000);
    rateLimit("ip:1", 3, 60_000);
    rateLimit("ip:1", 3, 60_000);
    expect(rateLimit("ip:1", 3, 60_000)).toBe(false);
    expect(rateLimit("ip:1", 3, 60_000)).toBe(false);
  });

  it("resets after the window elapses", () => {
    expect(rateLimit("ip:1", 2, 60_000)).toBe(true);
    expect(rateLimit("ip:1", 2, 60_000)).toBe(true);
    expect(rateLimit("ip:1", 2, 60_000)).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(rateLimit("ip:1", 2, 60_000)).toBe(true);
  });
});