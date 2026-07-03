export const Session = {
  cookieName: "pbi_sid",
  // SECURITY: shortened from 365d to 30d to limit the impact of a stolen cookie.
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;
