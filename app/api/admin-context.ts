import * as cookie from "cookie";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyAdminToken } from "./lib/jwt";
import { AdminSession } from "@contracts/constants";

export type AdminContext = {
  req: Request;
  resHeaders: Headers;
  admin?: { id: number; name: string; email: string; role: string } | null;
};

export async function createAdminContext(
  opts: FetchCreateContextFnOptions,
): Promise<AdminContext> {
  const ctx: AdminContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Read the admin JWT from the httpOnly cookie (not the x-admin-token header).
  const cookies = cookie.parse(opts.req.headers.get("cookie") || "");
  const adminToken = cookies[AdminSession.cookieName];
  if (adminToken) {
    const payload = await verifyAdminToken(adminToken);
    if (payload) {
      ctx.admin = {
        id: payload.id as number,
        name: payload.name as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    }
  }

  return ctx;
}
