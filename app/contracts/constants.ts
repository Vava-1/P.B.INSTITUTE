export const Session = {
  cookieName: "pbi_sid",
  // SECURITY: shortened from 365d to 30d to limit the impact of a stolen cookie.
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
} as const;

export const AdminSession = {
  // httpOnly cookie holding the admin JWT.
  cookieName: "admin_session",
  // Non-httpOnly cookie holding the CSRF token (readable by JS to put in x-csrf-token header).
  csrfCookieName: "admin_csrf",
  maxAgeMs: 8 * 60 * 60 * 1000, // 8h — matches JWT_SECRET expiry in api/lib/jwt.ts
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;
