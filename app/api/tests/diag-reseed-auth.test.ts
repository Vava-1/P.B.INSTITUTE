import { describe, it, expect, vi } from "vitest";
import app from "../boot";
import { signAdminToken } from "../lib/jwt";
import { AdminSession } from "@contracts/constants";

// Boot handlers call getDb().execute(); provide a stub so they never touch a
// real DB pool. The auth assertions below fail before any handler runs.
vi.mock("../queries/connection", () => ({
  getDb: () => ({
    execute: async () => [],
  }),
}));

function cookieHeader(token: string): string {
  return `${AdminSession.cookieName}=${token}`;
}

describe("diagnostic endpoints require admin auth", () => {
  it("returns 401 for GET /api/diag without an admin cookie", async () => {
    const res = await app.request("/api/diag");
    expect(res.status).toBe(401);
  });

  it("returns 401 for POST /api/reseed without an admin cookie", async () => {
    const res = await app.request("/api/reseed", { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for GET /api/diag when the token role is not super_admin", async () => {
    const token = await signAdminToken({
      id: 2,
      name: "Content Editor",
      email: "editor@example.com",
      role: "content_manager",
    });
    const res = await app.request("/api/diag", {
      headers: { Cookie: cookieHeader(token) },
    });
    expect(res.status).toBe(403);
  });
});