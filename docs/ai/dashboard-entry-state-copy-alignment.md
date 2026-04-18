# Dashboard Entry-State Copy Alignment

## Purpose

Lock the canonical copy for dashboard entry-state experience during the Supabase Block phase.

This document is copy-only.
It does not define state logic, backend behavior, routing changes, or notification behavior.

---

## Canonical Copy Per State

### loading
**Must match exactly**
Preparing your dashboard…

### unauthenticated
**Must match exactly**
Taking you to sign-in…

Notes:
- The dashboard page currently displays this copy before redirecting to `/auth/sign-in`.
- No dashboard-side logic change is implied by this wording.

### invited_pending_acceptance
**Must match exactly**
Taking you to your invitation…

### error
**Must match exactly**
We could not prepare your dashboard right now.

### member capability explanation
**Must match exactly**
As a cooperative member, you can take part in the available dashboard actions in this view.

### non_member_no_invitation capability explanation
**Must match exactly**
You can share a local idea here. Other cooperative actions stay read-only until membership is available.

### non_member_no_invitation explanatory block
**Must match exactly**
You can explore the dashboard and share a local idea here. Other cooperative actions will become available once you are a member.

### programs explanation
**May vary slightly**
Programs stay visible here so you can understand what is available. Full program actions become available in member view.

Allowed slight variation:
- “member view” may be phrased as “member mode” or “as a member”
- meaning must remain unchanged

---

## Must Match Exactly

The following strings are locked and must match exactly unless Main Hub Authority revises them:

- Preparing your dashboard…
- Taking you to sign-in…
- Taking you to your invitation…
- We could not prepare your dashboard right now.
- As a cooperative member, you can take part in the available dashboard actions in this view.
- You can share a local idea here. Other cooperative actions stay read-only until membership is available.
- You can explore the dashboard and share a local idea here. Other cooperative actions will become available once you are a member.

---

## May Vary Slightly

These may vary slightly in wording while preserving meaning:

- programs visibility explanation

Any variation must remain:
- neutral
- trust-first
- non-urgent
- free of backend or notification claims

---

## Prohibited Phrases

Do not use:
- urgent or pressure language
  - “Act now”
  - “Immediately”
  - “Right away”
  - “Don’t miss this”

Do not use backend or system-claim language:
- “Your token expired”
- “The API could not load”
- “The backend is unavailable”
- “Membership lookup failed”
- “Invitation RPC failed”

Do not use semantic drift:
- “Referral”
- “Reward”
- “Unlock benefits now”
- “Claim your access”
- “Upgrade now”

Do not imply hidden truth not present in the current phase:
- “Your membership is being processed”
- “Your invitation has been verified by the system”
- “We confirmed your account state”

---

## Implementation Boundary

- copy-only
- no state logic changes
- no new components
- no backend assumptions
- no notification modifications

---

## Onboarding Mirror Note

SYNC NOTE — ONBOARDING COPY ALIGNMENT ONLY

SOURCE OF TRUTH:
docs/ai/dashboard-entry-state-copy-alignment.md

ROLE:
Tier-2 / Onboarding Mirror Only

INSTRUCTION:
Mirror approved entry-state wording only where the same experience surface already exists.

RULES:
- copy-only
- no logic changes
- no new components
- no alternate state interpretation
- do not infer backend truth
- do not alter invitation semantics
- do not alter notification behavior

MUST MATCH EXACTLY where applicable:
- Preparing your dashboard…
- Taking you to sign-in…
- Taking you to your invitation…
- We could not prepare your dashboard right now.
- As a cooperative member, you can take part in the available dashboard actions in this view.
- You can share a local idea here. Other cooperative actions stay read-only until membership is available.
- You can explore the dashboard and share a local idea here. Other cooperative actions will become available once you are a member.

MAY VARY SLIGHTLY:
- programs explanation copy

PROHIBITED:
- urgency language
- backend claims
- invitation semantic drift
- logic changes
- component additions
