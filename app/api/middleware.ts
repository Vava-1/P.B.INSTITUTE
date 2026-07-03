import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext, AdminContext } from "./context";
import { verifyAdminToken } from "./lib/jwt";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const authedQuery = t.procedure.use(requireAuth);

// Admin auth: accepts an x-admin-token JWT OR falls back to ctx.user.role === "admin".
// Resolves ctx.admin with the admin user's id/name/email/role for downstream RBAC.
const requireAdmin = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  const adminToken = ctx.req.headers.get("x-admin-token");

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
          user: {
            id: payload.id as number,
            name: payload.name as string,
            email: payload.email as string,
            role: payload.role as string,
            unionId: "",
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignInAt: new Date(),
          },
          admin,
        },
      });
    }
  }

  if (ctx.user?.role === "admin") {
    return next({
      ctx: {
        ...ctx,
        admin: {
          id: ctx.user.id,
          name: ctx.user.name ?? "",
          email: ctx.user.email ?? "",
          role: ctx.user.role,
        } as AdminContext,
      },
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: ErrorMessages.unauthenticated,
  });
});

// Base admin procedure — any authenticated admin.
export const adminQuery = t.procedure.use(requireAdmin);

// RBAC: restrict to one of the listed admin roles. Chained after requireAdmin.
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

// Convenience role-restricted admin procedures.
export const superAdminQuery = adminQuery.use(requireRole(["super_admin"]));
export const contentAdminQuery = adminQuery.use(requireRole(["super_admin", "content_manager"]));
export const financeAdminQuery = adminQuery.use(requireRole(["super_admin", "finance"]));
