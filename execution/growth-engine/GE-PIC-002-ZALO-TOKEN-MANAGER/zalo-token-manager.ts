import { storage } from "../storage";

const ZALO_SERVICE = "zalo";

interface ZaloTokenConfig {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
  updatedAt?: string;
}

export interface ZaloTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType?: string;
}

let refreshInFlight: Promise<ZaloTokenPair> | null = null;

function readStoredConfig(): ZaloTokenConfig {
  const config = process.env.ZALO_TOKEN_CONFIG;
  if (!config) return {};

  try {
    const parsed = JSON.parse(config);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getBootstrapTokens(): ZaloTokenPair | null {
  const accessToken = process.env.ZALO_ZNS_ACCESS_TOKEN;
  const refreshToken = process.env.ZALO_REFRESH_TOKEN;

  if (!accessToken || !refreshToken) return null;

  /*
   * The existing Replit secret does not expose a trustworthy expiry
   * timestamp, so bootstrap conservatively uses a short-lived local
   * expiry marker. The first real OAuth refresh will replace it with
   * Zalo's authoritative expires_in value.
   */
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

async function persist(pair: ZaloTokenPair): Promise<ZaloTokenPair> {
  await storage.upsertIntegrationConfig({
    service: ZALO_SERVICE,
    config: {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      expiresAt: pair.expiresAt.toISOString(),
      tokenType: pair.tokenType ?? "bearer",
      updatedAt: new Date().toISOString(),
    },
    isEnabled: true,
    lastSyncAt: new Date(),
  });

  return pair;
}

async function loadStored(): Promise<ZaloTokenPair | null> {
  const record = await storage.getIntegrationConfig(ZALO_SERVICE);

  const config = record?.config as ZaloTokenConfig | null | undefined;

  if (
    !config?.accessToken ||
    !config.refreshToken ||
    !config.expiresAt
  ) {
    return null;
  }

  const expiresAt = new Date(config.expiresAt);

  if (Number.isNaN(expiresAt.getTime())) {
    return null;
  }

  return {
    accessToken: config.accessToken,
    refreshToken: config.refreshToken,
    expiresAt,
    tokenType: config.tokenType,
  };
}

async function bootstrapIfNecessary(): Promise<ZaloTokenPair> {
  const stored = await loadStored();

  if (stored) {
    return stored;
  }

  const bootstrap = getBootstrapTokens();

  if (!bootstrap) {
    throw new Error(
      "[Zalo Token Manager] No persisted token pair and no bootstrap token pair configured.",
    );
  }

  return persist(bootstrap);
}

async function refreshZaloToken(
  current: ZaloTokenPair,
): Promise<ZaloTokenPair> {
  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error(
      "[Zalo Token Manager] ZALO_APP_ID and ZALO_APP_SECRET are required for OAuth refresh.",
    );
  }

  const body = new URLSearchParams({
    refresh_token: current.refreshToken,
    app_id: appId,
    grant_type: "refresh_token",
  });

  let response: Response;

  try {
    response = await fetch(
        "https://oauth.zaloapp.com/v4/oa/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          secret_key: appSecret,
        },
        body,
      },
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "network error";
    throw new Error(
      `[Zalo Token Manager] OAuth refresh request failed: ${reason}`,
    );
  }

  let payload: {
    error?: unknown;
    error_description?: unknown;
    error_name?: unknown;
    error_reason?: unknown;
    access_token?: unknown;
    refresh_token?: unknown;
    expires_in?: unknown;
    token_type?: unknown;
  };

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `[Zalo Token Manager] OAuth refresh returned invalid JSON (HTTP ${response.status}).`,
    );
  }

  if (!response.ok || payload.error !== 0) {
    const detail = [
      payload.error_name,
      payload.error_description,
      payload.error_reason,
    ]
      .filter((value) => typeof value === "string" && value.length > 0)
      .join("; ");

    const code =
      payload.error === undefined ? "unknown" : String(payload.error);

      const error = new Error(
      `[Zalo Token Manager] OAuth refresh rejected by Zalo (error=${code})` +
        (detail ? `: ${detail}` : "."),
      );

      if (typeof payload.error === "number") {
        (error as Error & { zaloErrorCode?: number }).zaloErrorCode =
          payload.error;
      }

      throw error;
  }

  if (
    typeof payload.access_token !== "string" ||
    payload.access_token.length === 0 ||
    typeof payload.refresh_token !== "string" ||
    payload.refresh_token.length === 0 ||
    typeof payload.expires_in !== "number" ||
    !Number.isFinite(payload.expires_in) ||
    payload.expires_in <= 0
  ) {
    throw new Error(
      "[Zalo Token Manager] OAuth refresh succeeded but returned an invalid token payload.",
    );
  }

  const expiresAt = new Date(
    Date.now() + payload.expires_in * 1000,
  );

  const pair: ZaloTokenPair = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt,
    tokenType:
      typeof payload.token_type === "string"
        ? payload.token_type
        : "bearer",
  };

  return persist(pair);
}

async function refreshSingleFlight(
  current: ZaloTokenPair,
): Promise<ZaloTokenPair> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  const refreshPromise = (async (): Promise<ZaloTokenPair> => {
    try {
      return await refreshZaloToken(current);
    } catch (error) {
      const zaloErrorCode =
        error instanceof Error &&
        typeof (error as Error & { zaloErrorCode?: unknown }).zaloErrorCode ===
          "number"
          ? (error as Error & { zaloErrorCode: number }).zaloErrorCode
          : undefined;

      if (zaloErrorCode !== -14014) {
        throw error;
      }

      const bootstrapRefreshToken = process.env.ZALO_REFRESH_TOKEN;

      if (!bootstrapRefreshToken) {
        throw error;
      }

      return refreshZaloToken({
        ...current,
        refreshToken: bootstrapRefreshToken,
      });
    }
  })();

  refreshInFlight = refreshPromise;

  try {
    return await refreshPromise;
  } finally {
    if (refreshInFlight === refreshPromise) {
      refreshInFlight = null;
    }
  }
}

/**
 * Canonical Zalo access-token authority.
 *
 * - the persisted pair is authoritative once bootstrapped;
 * - when the persisted pair is expired, refresh is performed
 *   automatically via refreshSingleFlight() below (single-flight,
 *   with bounded -14014 recovery using the configured bootstrap
 *   refresh token);
 * - callers must never read ZALO_ZNS_ACCESS_TOKEN directly — this
 *   function (and getZaloAccessToken()) is the sole entry point.
 */
export async function getZaloTokenPair(): Promise<ZaloTokenPair> {
  const pair = await bootstrapIfNecessary();

  if (pair.expiresAt.getTime() > Date.now()) {
    return pair;
  }

  return refreshSingleFlight(pair);
}

/**
 * Returns the current access token through the canonical authority.
 */
export async function getZaloAccessToken(): Promise<string> {
  const pair = await getZaloTokenPair();
  return pair.accessToken;
}
