function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface MomoConfig {
  subscriptionKey: string;
  apiUser?: string;
  apiKey?: string;
  baseUrl: string;
  environment: string;
  currency: string;
  callbackHost: string;
}

let cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(config: MomoConfig): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry) return cachedToken.token;

  if (!config.apiUser || !config.apiKey) {
    // SECURITY: do not auto-provision an API user in production — that would
    // silently mint credentials and is a sign of misconfiguration. Fail loudly.
    if (process.env.NODE_ENV === "production") {
      throw new Error("MTN_MOMO_API_USER / MTN_MOMO_API_KEY must be set in production.");
    }
    await setupApiUser(config);
  }

  const credentials = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString("base64");
  const res = await fetch(`${config.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MTN MoMo auth failed (${res.status}): ${text}`);
  }

  const data = await res.json() as any;
  cachedToken = {
    token: data.access_token,
    expiry: Date.now() + (parseInt(data.expires_in) - 60) * 1000,
  };
  return cachedToken.token;
}

async function setupApiUser(config: MomoConfig): Promise<void> {
  const referenceId = generateId();
  const res = await fetch(`${config.baseUrl}/v1_0/apiuser`, {
    method: "POST",
    headers: {
      "X-Reference-Id": referenceId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerCallbackHost: config.callbackHost }),
  });

  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`MTN MoMo API user creation failed (${res.status}): ${text}`);
  }

  const keyRes = await fetch(`${config.baseUrl}/v1_0/apiuser/${referenceId}/apikey`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": config.subscriptionKey },
  });

  if (!keyRes.ok) {
    const text = await keyRes.text();
    throw new Error(`MTN MoMo API key creation failed (${keyRes.status}): ${text}`);
  }

  const keyData = (await keyRes.json()) as any;
  (config as any).apiUser = referenceId;
  (config as any).apiKey = keyData.apiKey;

  // SECURITY: never log the API key in production. Only emit a one-time
  // bootstrap message in non-prod so operators know to save the credentials.
  if (process.env.NODE_ENV !== "production") {
    console.log("[MTN MoMo] Created API User:", referenceId);
    console.log("[MTN MoMo] API Key provisioned. Save MTN_MOMO_API_USER and MTN_MOMO_API_KEY to your .env for future runs.");
    console.log("[MTN MoMo] (API key value intentionally not printed.)");
  }
}

export async function requestToPay(
  config: MomoConfig,
  amount: number,
  phoneNumber: string,
  externalId: string,
): Promise<{ referenceId: string }> {
  const token = await getAccessToken(config);
  const referenceId = generateId();

  const formattedPhone = phoneNumber.startsWith("250")
    ? phoneNumber
    : phoneNumber.startsWith("0")
      ? `250${phoneNumber.slice(1)}`
      : `250${phoneNumber}`;

  const body = {
    amount: amount.toString(),
    currency: config.currency,
    externalId,
    payer: { partyIdType: "MSISDN", partyId: formattedPhone },
    payerMessage: "Payment for enrollment at Pacemaker Institute",
    payeeNote: "Thank you for choosing Pacemaker Institute. Enter PIN to confirm.",
  };

  const res = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": config.environment,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MTN MoMo request to pay failed (${res.status}): ${text}`);
  }

  return { referenceId };
}

export async function checkTransactionStatus(
  config: MomoConfig,
  referenceId: string,
): Promise<{ status: string; reason?: string }> {
  const token = await getAccessToken(config);

  const res = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": config.environment,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MTN MoMo status check failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;
  return { status: data.status, reason: data.reason };
}

export function buildMomoConfig(): MomoConfig | null {
  const subKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  if (!subKey) return null;

  return {
    subscriptionKey: subKey,
    apiUser: process.env.MTN_MOMO_API_USER,
    apiKey: process.env.MTN_MOMO_API_KEY,
    baseUrl: process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com",
    environment: process.env.MTN_MOMO_ENVIRONMENT ?? "sandbox",
    currency: process.env.MTN_MOMO_CURRENCY ?? "RWF",
    callbackHost: process.env.MTN_MOMO_CALLBACK_HOST ?? "https://pacemakerinstitute.rw",
  };
}

export { generateId as uuid };
