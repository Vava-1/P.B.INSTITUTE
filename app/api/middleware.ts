import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
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
export const adminQuery = t.procedure.use(async (opts) => {
  const { ctx, next } = opts;

  const adminToken = ctx.req.headers.get("x-admin-token");

  if (adminToken) {
    const payload = await verifyAdminToken(adminToken);
    if (payload) {
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
        },
      });
    }
  }

  if (ctx.user?.role === "admin") {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: ErrorMessages.unauthenticated,
  });
});
