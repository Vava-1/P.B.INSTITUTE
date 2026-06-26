import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? (() => { throw new Error("JWT_SECRET env var is required"); })()
);

export interface AdminTokenPayload extends JWTPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function signAdminToken(payload: Omit<AdminTokenPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}
