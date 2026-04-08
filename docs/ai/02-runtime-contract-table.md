# RUNTIME CONTRACT TABLE — LAMBSBOOK

## PURPOSE
This document defines the canonical runtime contracts that AI tools and human implementers must follow.

No endpoint, request shape, response expectation, or caller rule may be treated as implicit.

---

## CONTRACT RULES

### Rule 1 — Canonical routes only
Only approved runtime surfaces may be treated as valid system contracts.

### Rule 2 — Request and response shapes must be explicit
No caller or implementer may infer payload structure from memory or convenience.

### Rule 3 — Auth expectations must be explicit
Each route must state whether authentication is required and what identity scope is assumed.

### Rule 4 — Error meanings must be explicit
Status codes must not be treated as interchangeable.

### Rule 5 — Callers must be bounded
Each route must state which surface or layer is allowed to call it.

---

## CONTRACT TABLE

| Route | Method | Purpose | Auth Required | Canonical Caller | Request Shape | Response Shape | Error Contract | Source of Truth | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `/api/member/me` | GET | Determine whether authenticated user is already a canonical member | Yes | Dashboard / protected member-aware surfaces | Bearer token; no body | 200 with minimal member payload when user is member; 404 when not yet a member | 401 unauthenticated; 404 non-member; 5xx backend failure | Canonical backend member route | Membership truth check, not invitation discovery |
| `/api/member/pending-invitation` | GET | Discover whether authenticated non-member has a pending canonical invitation | Yes | Dashboard / protected non-member discovery surfaces | Bearer token; no body | 200 with `{ invitation: { id } }` when pending invitation exists, or `{ invitation: null }` when none exists | 401 unauthenticated; 5xx backend failure | Canonical backend member route | Read-only discovery route; does not accept invitation |
| `/api/member/accept-invitation` | POST | Accept canonical invitation and materialize governed membership outcome | Yes | Invitation acceptance surface only | JSON body with `invitationId`; bearer token | Success response confirming acceptance outcome | 400 invalid input; 401 unauthenticated; 403 forbidden when applicable; 5xx backend failure | Canonical backend member route + governed RPC | Acceptance is the moment of domain materialization |
| `/api/member/materialize-invitation` | POST | Convert invite token into canonical invitation materialization context when valid | Yes | Controlled invitation-entry flow only | JSON body with `inviteToken`; bearer token | Success response containing invitation materialization result, including invitation identifier when valid | 400 invalid input/token; 401 unauthenticated; 403 forbidden when applicable; 5xx backend failure | Canonical backend member route + governed RPC | Current runtime flow supports inviteToken → materialize → accept |
| `/api/member/*` | ALL | Canonical membership runtime surface namespace | Varies by route | Onboarding/dashboard/backend bridge callers only | Route-specific | Route-specific | Route-specific | Canonical mounted member route family | This namespace is authoritative; parallel legacy surfaces must not be treated as equal runtime authority |

---

## CURRENT CANONICAL FLOW

### Member discovery flow
1. call `GET /api/member/me`
2. if 200: user is member
3. if 404: user is not yet a member
4. then call `GET /api/member/pending-invitation` for non-member invitation discovery

---

### Invitation acceptance flow
Current canonical runtime flow:
1. invite token available
2. authenticate user
3. call `POST /api/member/materialize-invitation`
4. receive invitation context / invitation id
5. call `POST /api/member/accept-invitation`

Open design question remains whether SQL truth later permits safe simplification to:
- inviteToken → accept

Until verified, current contract remains:
- inviteToken → materialize → accept

---

## CANONICAL RESPONSE INTERPRETATION RULES

### `/api/member/me`
- 200 means canonical member exists
- 404 means canonical member does not yet exist
- 404 must not be misread as generic failure in this specific flow

### `/api/member/pending-invitation`
- `invitation: null` means no pending invitation discovered
- `invitation: { id }` means pending invitation exists
- this route does not itself perform acceptance

### `/api/member/accept-invitation`
- success means governed acceptance executed
- caller must not treat this route as generic token discovery

### `/api/member/materialize-invitation`
- success means token was translated into valid invitation materialization context
- caller must not skip acceptance unless future contract explicitly changes

---

## CANONICAL CALLER RULES

### Dashboard
Allowed to:
- call `/api/member/me`
- call `/api/member/pending-invitation`

Not allowed to:
- invent membership truth locally
- infer invitation acceptance without canonical route result

---

### Invitation acceptance surface
Allowed to:
- call `/api/member/accept-invitation`
- call `/api/member/materialize-invitation` when invite-token flow requires it

Not allowed to:
- create alternate acceptance semantics
- bypass canonical route family

---

### Onboarding Gateway
Allowed to:
- participate as presentation/bridge surface only
- forward users into canonical route flows

Not allowed to:
- become independent domain truth authority

---

## DRIFT PREVENTION RULES

STOP if any proposed change would:
- introduce new membership runtime routes without approval
- redefine response semantics casually
- collapse materialize and accept without SQL truth verification
- create parallel legacy route authority
- let frontend code infer domain truth without route confirmation
- weaken auth requirements by convenience

---

## CANONICAL SUMMARY

Canonical membership runtime namespace:
- `/api/member/*`

Current canonical flow:
- `inviteToken -> materialize -> accept`

Discovery logic:
- `member/me` first
- then `pending-invitation` for non-member discovery

These contracts must be inspected and updated when live implementation truth changes, but they must never be left implicit.

