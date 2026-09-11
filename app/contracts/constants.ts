export const AdminSession = {
  cookieName: "admin_session",
  csrfCookieName: "admin_csrf",
  maxAgeMs: 8 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;
