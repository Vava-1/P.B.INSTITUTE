import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
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
