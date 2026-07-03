import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS256";

// SECURITY: shortened from "1 year" to "30 days". A stolen session cookie is
// now valid for at most 30 days instead of 365. Combined with the SameSite=Lax
// cookie, this dramatically shrinks the post-theft window.
const SESSION_EXPIRY = "30d";

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  const secret = new TextEncoder().encode(env.sessionSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.sessionSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const { unionId, clientId } = payload;
    if (!unionId || !clientId) {
      return null;
    }
    return { unionId, clientId } as SessionPayload;
  } catch {
    return null;
  }
}
