import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

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
export const adminQuery = t.procedure.use(async (opts) => {
  const { ctx, next } = opts;

  // Check for admin token in header
  const adminToken = ctx.req.headers.get("x-admin-token");
  if (adminToken) {
    try {
      const payload = JSON.parse(Buffer.from(adminToken, "base64").toString());
      if (payload.id && payload.email && payload.exp > Date.now()) {
        return next({
          ctx: {
            ...ctx,
            user: {
              id: payload.id,
              name: payload.name,
              email: payload.email,
              role: payload.role,
              unionId: "",
              avatar: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastSignInAt: new Date(),
            },
          },
        });
      }
    } catch {
      // Invalid token
    }
  }

  // Fall back to OAuth admin check
  if (ctx.user && ctx.user.role === "admin") {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: ErrorMessages.unauthenticated,
  });
});
