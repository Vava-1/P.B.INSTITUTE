import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  // SECURITY: use SameSite=Lax always (not None). The SPA and /api/trpc are same-origin,
  // so Lax is sufficient and protects against CSRF on cross-site requests.
  // Combined with the OAuth state nonce + admin token in Authorization-style header,
  // this closes the CSRF surface.
  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: !localhost,
  };
}
