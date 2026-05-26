# STATE MACHINE AND FLOW — LAMBSBOOK

## PURPOSE
This document defines the canonical user states, state transitions, allowed flows, forbidden flows, and decision logic for Lambsbook membership and invitation runtime behavior.

No execution layer may infer state transitions implicitly.

---

## CORE RULE

User-facing flow must always reflect canonical backend/domain truth.

UI may not invent or override state.
Gateway may not create domain truth.
Acceptance is the materialization moment of canonical membership.

---

## PRIMARY USER STATES

### State A — Unauthenticated visitor
Definition:
- no authenticated session
- may arrive from direct visit or invite-linked flow

Allowed characteristics:
- can view public onboarding surfaces
- can view approved mission/content language variants
- may carry invite token in URL or entry context

Not yet allowed:
- canonical member discovery
- pending invitation discovery requiring auth
- invitation acceptance execution

Allowed next transitions:
- State B (authenticated non-member without pending invitation)
- State C (authenticated non-member with pending invitation context)

---

### State B — Authenticated non-member with no pending invitation discovered
Definition:
- authenticated user
- canonical member does not exist
- no pending invitation currently discovered

Detection logic:
1. `GET /api/member/me` returns 404
2. `GET /api/member/pending-invitation` returns `{ invitation: null }`

Allowed characteristics:
- user is authenticated
- user is not yet canonical member
- no current pending invitation is available for governed acceptance

Allowed next transitions:
- remain in State B
- move to State C if pending invitation later becomes discoverable
- move to State D if invite-token materialization flow starts successfully

Forbidden interpretations:
- must not be treated as member
- must not be treated as acceptance-ready without canonical discovery/materialization
- must not be treated as generic route failure

---

### State C — Authenticated non-member with pending invitation discovered
Definition:
- authenticated user
- canonical member does not exist
- pending invitation exists and is discoverable

Detection logic:
1. `GET /api/member/me` returns 404
2. `GET /api/member/pending-invitation` returns `{ invitation: { id } }`

Allowed characteristics:
- acceptance may be presented through approved invitation-acceptance UX
- invitation id is available through canonical discovery route

Allowed next transitions:
- State E through governed acceptance
- remain in State C if acceptance not yet executed

Forbidden interpretations:
- must not be treated as already accepted
- must not bypass canonical acceptance route
- must not invent alternate invitation identity

---

### State D — Authenticated non-member in invite-token materialization flow
Definition:
- authenticated user
- invite token is present
- canonical member does not yet exist
- materialization step is being executed or has yielded invitation context

Detection logic:
- invite token present in canonical flow
- `POST /api/member/materialize-invitation` succeeds

Allowed characteristics:
- invitation context may be derived from token through governed route
- downstream acceptance may proceed using canonical invitation context

Allowed next transitions:
- State C if invitation becomes explicit pending invitation context
- State E if acceptance succeeds
- return to State B if materialization fails and no pending invitation exists

Forbidden interpretations:
- materialization success does not itself mean membership exists
- token presence alone does not equal acceptance
- materialization must not be treated as final domain truth

---

### State E — Canonical member exists
Definition:
- authenticated user
- canonical membership exists

Detection logic:
- `GET /api/member/me` returns 200

Allowed characteristics:
- member-aware protected surfaces may render
- pending invitation discovery is no longer the primary identity state
- invitation-acceptance UX should not be treated as primary state

Allowed next transitions:
- remain in State E unless future explicit domain rules define otherwise

Forbidden interpretations:
- must not be treated as non-member
- must not route through non-member acceptance flow as primary logic

---

## PRIMARY FLOW LOGIC

### Flow 1 — Member discovery
1. authenticated surface needs canonical user state
2. call `GET /api/member/me`
3. if 200 → State E
4. if 404 → continue to pending invitation discovery
5. call `GET /api/member/pending-invitation`
6. if `{ invitation: null }` → State B
7. if `{ invitation: { id } }` → State C

Rule:
- `member/me` is the primary membership truth check
- `pending-invitation` is secondary discovery for authenticated non-members only

---

### Flow 2 — Invite-token materialization flow
1. unauthenticated or authenticated user arrives with invite token
2. if unauthenticated, authenticate first
3. after authentication, execute `POST /api/member/materialize-invitation`
4. if success, obtain invitation materialization context
5. proceed toward canonical acceptance flow
6. acceptance success transitions to State E

Rule:
- invite token is entry context, not domain completion
- materialization is intermediate, not final truth

---

### Flow 3 — Canonical invitation acceptance
1. user is in State C or valid State D-derived invitation context
2. execute `POST /api/member/accept-invitation`
3. if governed acceptance succeeds, canonical member truth is created/finalized
4. subsequent `GET /api/member/me` should resolve as 200
5. user is now in State E

Rule:
- acceptance is the moment of canonical membership materialization
- UI success must reflect backend/domain success, not optimism

---

## DECISION TABLE

| Condition | Route Result | Canonical State | UI Meaning | Allowed Next Action |
|---|---|---|---|---|
| Unauthenticated | N/A | State A | Public/onboarding only | Authenticate |
| Authenticated, member exists | `member/me = 200` | State E | Member exists | Render member-aware flow |
| Authenticated, non-member, no pending invitation | `member/me = 404`, `pending-invitation = null` | State B | Non-member, no pending invitation | Stay non-member or enter valid invite flow |
| Authenticated, non-member, pending invitation | `member/me = 404`, `pending-invitation = {id}` | State C | Non-member with acceptance-ready invitation | Present governed acceptance path |
| Authenticated, token materialized | `materialize-invitation = success` | State D | Token translated to invitation context | Proceed to canonical acceptance |
| Acceptance succeeded | `accept-invitation = success` | State E | Member now exists | Render member flow |

---

## FORBIDDEN FLOW RULES

### Forbidden 1 — Token implies acceptance
Invite token presence must never be treated as proof of membership or acceptance.

---

### Forbidden 2 — Materialization implies acceptance
Materialization must never be treated as final domain completion.

---

### Forbidden 3 — UI optimism creates truth
UI must not show accepted/member-final state unless canonical backend/domain result supports it.

---

### Forbidden 4 — Parallel membership discovery logic
Frontend must not invent alternate membership truth checks outside canonical route family.

---

### Forbidden 5 — Gateway-originated domain truth
Gateway may guide users into the canonical flow, but may not create canonical membership truth itself.

---

### Forbidden 6 — Ambiguous error collapse
404 member-not-found in `member/me` must not be flattened into generic fatal error in the discovery flow.

---

## ERROR AND RECOVERY LOGIC

### Case 1 — `member/me` returns 404
Interpretation:
- user is not yet a canonical member
Action:
- continue to pending invitation discovery
Do not:
- treat as system failure by default

---

### Case 2 — `pending-invitation` returns null
Interpretation:
- authenticated non-member without discoverable pending invitation
Action:
- remain in State B

---

### Case 3 — `materialize-invitation` fails
Interpretation:
- token invalid, expired, unauthorized, or otherwise unusable
Action:
- do not claim acceptance readiness
- fall back to canonical non-member handling
- surface approved failure handling in UX

---

### Case 4 — `accept-invitation` fails
Interpretation:
- governed acceptance did not complete
Action:
- do not transition user to member state
- retain non-member invitation state or failure state according to backend truth

---

## CANONICAL SUMMARY

Primary states:
- A unauthenticated visitor
- B authenticated non-member, no pending invitation
- C authenticated non-member, pending invitation discovered
- D authenticated non-member in materialization flow
- E canonical member exists

Primary truth path:
- `member/me` first
- then `pending-invitation`
- then `materialize-invitation` if token flow applies
- then `accept-invitation`
- then member exists

Acceptance, not token presence, is the canonical materialization moment.

