import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./auth/auth";

export type AdminContext = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  admin?: AdminContext;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here — admin token path will populate ctx.admin
    // inside the adminQuery middleware.
  }
  return ctx;
}
