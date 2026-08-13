# GE-REC-ZALO-TOKEN-MANAGER

Implementation Authority

GE-RMP-014

Repository

Current canonical Replit repository root

Production Surface

server/services/zalo-transport.ts
server/services/zalo-token-manager.ts
server/storage.ts
shared/schema.ts
server/integrations/zalo/auth.ts
server/integrations/zalo/adapter.ts
server/messaging/interface.ts
server/routes.ts
server/routes/admin.ts
server/services/notifications.ts
server/index.ts
package.json
tsconfig.json

Implementation Context Manifest

governance/cib/generated/CIB-EOS-RMP-001E-IMPLEMENTATION-CONTEXT-MANIFEST.md

Authority Stream
GE

Derived From
GE Zalo delivery recovery; current repository truth; controlled Token Manager recovery objective

# Mission

Implement the minimum required Zalo token lifecycle in the CURRENT application.

The production objective is reliable Zalo message delivery without repeated manual replacement of access and refresh tokens.

# Required Lifecycle

Initial bootstrap configuration uses:

- ZALO_ZNS_ACCESS_TOKEN
- ZALO_REFRESH_TOKEN

Then:

bootstrap
→ persist token pair using the application's existing persistence authority
→ evaluate expiry
→ refresh automatically when required
→ receive new access token + refresh token
→ persist BOTH replacement values
→ subsequent sends use the persisted/current pair

The user should not normally need to manually enter a new token pair after successful refresh.

# Required Behaviour

1. Use the application's existing persistence/DAL authority.
2. Establish exactly one canonical Zalo token authority.
3. Concurrent refreshes MUST be single-flight.
4. Handle Zalo -14014 refresh failure using the configured bootstrap refresh token.
5. Persist both access_token and refresh_token after successful refresh.
6. ZNS transport MUST obtain its access token through the canonical token authority.
7. Do not create a second token store.
8. Do not create a second Zalo transport.
9. Do not redesign unrelated messaging architecture.
10. Never expose credentials in logs or responses.

# Implementation Boundary

Before mutation:

- inspect persistence contract;
- inspect Zalo auth contract;
- inspect messaging interface;
- inspect ZNS transport;
- inspect current callers;
- identify the smallest implementation surface.

Then make only the required mutation.

Do not reconstruct the lost historical token manager verbatim. Historical behaviour is recovery evidence only. Current repository interfaces are authoritative.

# Static Verification

Verify:

- modified TypeScript;
- token persistence;
- refresh-token replacement;
- -14014 recovery;
- single-flight refresh;
- canonical access-token authority;
- absence of direct bootstrap access-token reads in the ZNS transport;
- absence of credential logging.

Do not fix unrelated pre-existing TypeScript errors unless they directly block the Zalo path.

# Runtime Verification

After static verification:

- verify credential PRESENCE only;
- never print credential values;
- use the actual application runtime;
- perform ONE controlled real Zalo test through the existing send path;
- do not claim success without the actual Zalo API response;
- stop after one successful controlled test or report the precise blocking Zalo error.

# Security

Never print, package, or expose:

- ZALO_APP_SECRET
- ZALO_REFRESH_TOKEN
- ZALO_ZNS_ACCESS_TOKEN
- .env files containing secrets
- secret keys

# Execution Stop Condition

No unrelated architecture changes.
No second token authority.
No second transport.
No credential exposure.
No credential rotation.
One implementation boundary.
One controlled runtime proof.
STOP.
