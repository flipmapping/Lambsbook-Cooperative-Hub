import { createHmac } from "crypto";

/**
 * GP-EXEC-010M-06A — Canonical Zalo authentication helper.
 *
 * Reads ZALO_ACCESS_TOKEN and ZALO_APP_SECRET from the runtime environment.
 * Generates appsecret_proof using the official algorithm:
 *
 *   HMAC_SHA256(key = ZALO_APP_SECRET, data = ZALO_ACCESS_TOKEN)
 *
 * Throws a descriptive error when either required variable is absent.
 */
export interface ZaloAuthentication {
  accessToken: string;
  appSecretProof: string;
}

export function getZaloAuthentication(): ZaloAuthentication {
  const accessToken = process.env.ZALO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "[Zalo] ZALO_ACCESS_TOKEN is not set. " +
        "Configure this environment variable before sending Zalo notifications."
    );
  }

  const appSecret = process.env.ZALO_APP_SECRET;
  if (!appSecret) {
    throw new Error(
      "[Zalo] ZALO_APP_SECRET is not set. " +
        "Configure this environment variable before sending Zalo notifications."
    );
  }

  const appSecretProof = createHmac("sha256", appSecret)
    .update(accessToken)
    .digest("hex");

  return { accessToken, appSecretProof };
}
