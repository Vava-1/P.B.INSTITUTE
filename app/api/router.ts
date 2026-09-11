import { publicRouter } from "./public-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  public: publicRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
