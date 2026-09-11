import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    console.warn(`⚠️  Missing env var ${name} — some features will be disabled until it's set.`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  openUrl: required("OPEN_URL"),
  siteUrl: process.env.SITE_URL ?? "",

  momoSubscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "",
  momoApiUser: process.env.MTN_MOMO_API_USER ?? "",
  momoApiKey: process.env.MTN_MOMO_API_KEY ?? "",
  momoBaseUrl: process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com",
  momoEnvironment: process.env.MTN_MOMO_ENVIRONMENT ?? "sandbox",
  momoCurrency: process.env.MTN_MOMO_CURRENCY ?? "RWF",
  momoCallbackHost: process.env.MTN_MOMO_CALLBACK_HOST ?? "",
};
