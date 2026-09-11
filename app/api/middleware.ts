import * as cookie from "cookie";
import { ErrorMessages, AdminSession } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext, AdminContext } from "./context";
import { verifyAdminToken } from "./lib/jwt";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// Admin auth: reads the JWT from the `admin_session` httpOnly cookie.
// For mutations, also validates the x-csrf-token header against the
// admin_csrf cookie value (double-submit cookie CSRF defense).
const requireAdmin = t.middleware(async (opts) => {
  const { ctx, next, type } = opts;

  // ── CSRF check for mutations ──
  // The x-csrf-token header must match the admin_csrf cookie value.
  // This is the "double-submit cookie" pattern: an attacker cannot read the
  // CSRF cookie (cross-origin) and therefore cannot forge the header.
  if (type === "mutation") {
    const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
    const csrfCookie = cookies[AdminSession.csrfCookieName];
    const csrfHeader = ctx.req.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "CSRF token mismatch. Please refresh the page and try again.",
      });
    }
  }

  const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
  const adminToken = cookies[AdminSession.cookieName];

  if (adminToken) {
    const payload = await verifyAdminToken(adminToken);
    if (payload) {
      const admin: AdminContext = {
        id: payload.id as number,
        name: payload.name as string,
        email: payload.email as string,
        role: payload.role as string,
      };
      return next({
        ctx: {
          ...ctx,
          admin,
        },
      });
    }
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: ErrorMessages.unauthenticated,
  });
});

export const adminQuery = t.procedure.use(requireAdmin);

type AdminRole = "super_admin" | "content_manager" | "finance" | "support";

export function requireRole(roles: AdminRole[]) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    const admin = (ctx as TrpcContext & { admin: AdminContext }).admin;
    if (!admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.unauthenticated,
      });
    }
    if (!roles.includes(admin.role as AdminRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }
    return next(opts);
  });
}

export const superAdminQuery = adminQuery.use(requireRole(["super_admin"]));
export const contentAdminQuery = adminQuery.use(requireRole(["super_admin", "content_manager"]));
export const financeAdminQuery = adminQuery.use(requireRole(["super_admin", "finance"]));
