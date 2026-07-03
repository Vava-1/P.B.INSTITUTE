import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // In production, missing required env vars are fatal.
    // In dev, warn loudly but allow the app to start (most local work doesn't need every integration).
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    console.warn(`⚠️  Missing env var ${name} — some features will be disabled until it's set.`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  // APP_SECRET is the OAuth client secret sent to the upstream IdP.
  appSecret: required("APP_SECRET"),
  // SESSION_SECRET signs user session JWTs. MUST be distinct from APP_SECRET so
  // that a leak of the OAuth client secret cannot be used to forge session tokens.
  // Falls back to APP_SECRET only in dev (with a warning) to keep local setup simple.
  sessionSecret: (() => {
    const v = process.env.SESSION_SECRET;
    if (!v) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("SESSION_SECRET is required in production (must differ from APP_SECRET).");
      }
      console.warn("⚠️  SESSION_SECRET not set — falling back to APP_SECRET for dev only. Set a distinct value for production.");
      return required("APP_SECRET");
    }
    return v;
  })(),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  authUrl: required("AUTH_URL"),
  openUrl: required("OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",

  // MTN MoMo
  momoSubscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "",
  momoApiUser: process.env.MTN_MOMO_API_USER ?? "",
  momoApiKey: process.env.MTN_MOMO_API_KEY ?? "",
  momoBaseUrl: process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com",
  momoEnvironment: process.env.MTN_MOMO_ENVIRONMENT ?? "sandbox",
  momoCurrency: process.env.MTN_MOMO_CURRENCY ?? "RWF",
  momoCallbackHost: process.env.MTN_MOMO_CALLBACK_HOST ?? "",
};
