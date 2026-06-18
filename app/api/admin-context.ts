import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export type AdminContext = {
  req: Request;
  resHeaders: Headers;
  admin?: { id: number; name: string; email: string; role: string } | null;
};

export async function createAdminContext(
  opts: FetchCreateContextFnOptions,
): Promise<AdminContext> {
  const ctx: AdminContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Check for admin session in x-admin-token header
  const adminToken = opts.req.headers.get("x-admin-token");
  if (adminToken) {
    try {
      const payload = JSON.parse(Buffer.from(adminToken, "base64").toString());
      if (payload.id && payload.email && payload.exp > Date.now()) {
        ctx.admin = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        };
      }
    } catch {
      // Invalid token
    }
  }

  return ctx;
}
