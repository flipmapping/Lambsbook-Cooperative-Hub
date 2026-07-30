# GP-EXEC-010M-06A

## Objective

Materialize a reusable Zalo authentication helper.

## Create

server/integrations/zalo/auth.ts

## Export

export interface ZaloAuthentication

export function getZaloAuthentication()

## Behaviour

Read:

- ZALO_ACCESS_TOKEN
- ZALO_APP_SECRET

Compute:

appsecret_proof =
HMAC_SHA256(appSecret, accessToken)

Return:

{
    accessToken,
    appSecretProof
}

Throw descriptive errors when required runtime
environment variables are missing.

Do NOT modify:

- Resend transport
- Notification persistence
- Public notification API

Refactor the Zalo adapter to consume
getZaloAuthentication().

Validation:

1. Build repository
2. Execute template inventory
3. Confirm error -1241 is eliminated
4. Archive evidence