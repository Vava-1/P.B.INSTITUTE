import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export type AdminContext = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  admin?: AdminContext;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  return { req: opts.req, resHeaders: opts.resHeaders };
}
