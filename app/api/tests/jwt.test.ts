import { describe, it, expect } from "vitest";
import { SignJWT } from "jose";
import { signAdminToken, verifyAdminToken } from "../lib/jwt";

// api/lib/jwt.ts derives its SECRET from process.env.JWT_SECRET at module
// load; setup.ts guarantees that value is present before this file imports.
const secretFor = (value: string) => new TextEncoder().encode(value);

function expiredToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ id: 1, name: "Ada", email: "ada@example.com", role: "super_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now - 7200)
    .setExpirationTime(now - 60)
    .sign(secretFor(process.env.JWT_SECRET ?? ""));
}

function tokenWithWrongSecret(): Promise<string> {
  return new SignJWT({ id: 1, name: "Ada", email: "ada@example.com", role: "super_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretFor("a-completely-different-secret-string"));
}

describe("admin JWT", () => {
  it("signs and verifies a token round-trip", async () => {
    const token = await signAdminToken({ id: 7, name: "Ada", email: "ada@example.com", role: "super_admin" });
    const payload = await verifyAdminToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.id).toBe(7);
    expect(payload?.name).toBe("Ada");
    expect(payload?.email).toBe("ada@example.com");
    expect(payload?.role).toBe("super_admin");
    expect(payload?.exp).toBeTypeOf("number");
  });

  it("returns null for a tampered token", async () => {
    const token = await signAdminToken({ id: 7, name: "Ada", email: "ada@example.com", role: "super_admin" });
    const tampered = token.slice(0, -2) + (token.endsWith("a") ? "zz" : "aa");
    expect(tampered).not.toBe(token);
    expect(await verifyAdminToken(tampered)).toBeNull();
  });

  it("returns null for an expired token", async () => {
    expect(await verifyAdminToken(await expiredToken())).toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    expect(await verifyAdminToken(await tokenWithWrongSecret())).toBeNull();
  });
});