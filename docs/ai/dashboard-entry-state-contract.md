# Dashboard Entry-State Contract

## Authority
Main Hub Authority

## Phase
Supabase Block — Frontend & Experience Layer Only

## Inspection Target
- `web/src/app/(protected)/dashboard/page.tsx`

## Inspection-True Exact Current State List
The live dashboard currently uses these exact entry-state values:

1. `loading`
2. `unauthenticated`
3. `error`
4. `invited_pending_acceptance`
5. `non_member_no_invitation`
6. `member`

No mutation may pretend that the current exact state strings are simpler than this until the live file is intentionally normalized.

## Inspection-True Current Render Structure
The live dashboard currently resolves entry behavior in this order:

1. `loading` renders its own loading UI
2. `unauthenticated || invited_pending_acceptance` share the same redirecting render branch
3. `error` renders its own error UI
4. default dashboard render path handles the remaining stateful surface
   - `member`
   - `non_member_no_invitation`

This means the current live render structure is partially separated but not fully normalized into one explicit top-level branch per exact state.

## Current Weaknesses Proven By Inspection
- `unauthenticated` and `invited_pending_acceptance` are mixed into one redirecting branch
- `member` and `non_member_no_invitation` are not separated into explicit top-level render branches
- current top-level branching does not expose one clean independent return path per exact current state
- render meaning is partly carried by downstream props such as member/non-member labeling instead of fully explicit top-level branch separation
- future mutation must distinguish current live reality from target normalized structure

## Target Normalized Entry-State Contract
The target normalized frontend contract for this blocked phase must preserve the exact live state names while making render behavior clearer and mutually exclusive.

## Exact States (Non-Negotiable)
1. `loading`
2. `unauthenticated`
3. `error`
4. `invited_pending_acceptance`
5. `non_member_no_invitation`
6. `member`

## Target Render Order
The dashboard should resolve entry states in this target order:

1. `loading`
2. `unauthenticated`
3. `error`
4. `invited_pending_acceptance`
5. `non_member_no_invitation`
6. `member`

This target order is for frontend clarity only and does not authorize backend or routing invention.

## Mutual Exclusivity Rules
- Only one exact entry state may render at a time.
- Top-level branching should make each exact state independently readable.
- `loading` must block all lower states.
- `unauthenticated` must not render alongside any other state.
- `error` must not render alongside any lower-priority state.
- `invited_pending_acceptance` must not render alongside `member` or `non_member_no_invitation`.
- `non_member_no_invitation` must not render alongside `member`.
- notification scaffold presence must not be treated as entry-state evidence.

## Allowed UI Per State

### `loading`
- loading indicator
- neutral container
- no invitation/member assertions
- no mixed dashboard content

### `unauthenticated`
- redirecting UI only
- no member or invitation assertions beyond redirect handling
- no mixed dashboard content

### `error`
- error message
- bounded recovery copy
- no invitation/member claims
- no mixed dashboard content

### `invited_pending_acceptance`
- redirecting or invitation-transition UI only
- no member dashboard sections
- no non-member-no-invitation fallback copy

### `non_member_no_invitation`
- explicit non-member fallback/dashboard experience only if already contract-safe
- no invitation-acceptance surface
- no member-only sections

### `member`
- member dashboard UI
- member-only sections
- existing notification bell may remain mounted if already present
- no invitation-acceptance UI
- no non-member-no-invitation fallback copy

## Forbidden Overlap
The following are forbidden:
- `loading` + any other state
- `unauthenticated` + any other state
- `error` + any lower-priority state
- `invited_pending_acceptance` + `member`
- `invited_pending_acceptance` + `non_member_no_invitation`
- `non_member_no_invitation` + `member`
- member dashboard mixed with non-member fallback copy
- invitation-transition UI mixed with member-only dashboard sections
- entry-state logic inferred from backend/schema/API assumptions

## Containment Rules
- frontend-only
- no Supabase access
- no schema inference
- no RPC invention
- no API-route invention
- no notification modification
- no domain logic invention

## Implementation Standard
Any later mutation must:
- preserve the exact live state list unless deliberate state renaming is separately authorized
- distinguish clearly between current live structure and target normalized structure
- enforce mutual exclusivity at the top render boundary
- avoid introducing backend-dependent meaning
- use only exact anchors proven by live inspection
