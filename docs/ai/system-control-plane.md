# SYSTEM CONTROL PLANE — LAMBSBOOK

## STATUS

Locked control-layer reference for cross-chat, cross-surface, and cross-tool coordination.

This document is the canonical control spine for:

* Strategic Chat
* Main Hub / Master Chat
* Onboarding Gateway Chat
* Claude execution
* Open Brain synchronization
* GitHub checkpoint discipline

It is not a feature spec.
It is the operating contract for how the system is governed, changed, and synchronized.

---

# 1. SYSTEM ROLE MAP

## Strategic Chat

Owns:

* doctrine
* next-step selection
* cross-chat synchronization
* execution discipline
* system-level oversight

Must:

* preserve invariants
* prevent drift
* choose one optimal next step

Must not:

* bypass truth hierarchy
* reopen settled architecture without contradiction

---

## Main Hub / Master Chat

Owns:

* backend truth
* runtime contracts
* state machine
* domain semantics
* packet definition for backend-aligned work

Must:

* define canonical API meaning
* define domain truth
* constrain Claude execution packets

Must not:

* let frontend define domain semantics
* create parallel runtime contracts

---

## Onboarding Gateway Chat

Owns:

* UI / UX behavior
* frontend state rendering
* dependent surface alignment

Must:

* consume Main Hub contracts exactly
* map backend truth into UI state
* remain subordinate to Main Hub authority

Must not:

* create truth
* invent APIs
* reinterpret membership or invitation meaning

---

## Claude

Role:

* bounded execution engine only

Must:

* execute packets exactly
* stop on ambiguity
* avoid invention
* avoid scope drift

Must not:

* define architecture
* define contracts
* rename concepts casually
* widen scope

---

## Open Brain

Role:

* reusable verified memory

Must store only:

* stable truths
* approved contracts
* recurring failure patterns
* reusable design and execution facts

Must not store:

* drafts
* guesses
* temporary runtime states
* unresolved contradictions

---

## GitHub

Role:

* accepted checkpoint history

Must contain:

* only reviewed and approved states
* clear milestone commits

Must not contain:

* uncontrolled experiments
* mixed-scope ambiguous states

---

## Replit

Role:

* execution and inspection environment

Used for:

* live code inspection
* bounded mutation
* runtime validation
* local verification

---

# 2. CORE LAWS

## Law 1 — One Identity Path

* `attachUserContext` is the sole identity resolver
* `req.user` is the sole identity carrier
* no downstream identity reconstruction

## Law 2 — One Truth Owner Per Concept

* identity → auth domain / canonical request context
* membership → `meh.members`
* invitation → `public.member_invitations`
* UI state → derived from backend truth, never source truth

## Law 3 — Gateway Expresses State, Hub Creates Truth

* Gateway may present and guide
* Hub performs canonical domain mutation

## Law 4 — No Parallel Contracts

* no second route family
* no legacy fallback as hidden authority
* no frontend-owned domain interpretation

## Law 5 — Optimization Never Overrides Meaning

* no shortcuts that distort invitation or membership meaning
* no caching or UI assumptions that create second truth

---

# 3. CANONICAL MEMBERSHIP FLOW

## Canonical runtime namespace

`/api/member/*`

## Canonical routes

* `GET /api/member/me`
* `GET /api/member/pending-invitation`
* `POST /api/member/accept-invitation`

## Canonical meanings

### `GET /api/member/me`

* `200` = canonical member exists
* `404` = canonical member does not yet exist

### `GET /api/member/pending-invitation`

* `{ invitation: null }` = no pending invitation
* `{ invitation: { id } }` = pending invitation exists

### `POST /api/member/accept-invitation`

* acceptance is the canonical materialization moment of membership

## Canonical sequence

`member/me → pending-invitation → accept-invitation`

---

# 4. CANONICAL UI STATE MAP

## Locked states

* `loading`
* `member`
* `invited`
* `no_invitation`
* `error`

## Locked mapping

* `member/me = 200` → `member`
* `member/me = 404` → continue discovery
* `pending-invitation = { invitation: { id } }` → `invited`
* `pending-invitation = { invitation: null }` → `no_invitation`
* real request/backend failure → `error`

## Forbidden

* collapsing real error into `no_invitation`
* claiming membership before backend confirmation

---

# 5. IDENTITY AND EMAIL BOUNDARY

## Canonical request identity shape

`req.user = { id, token, sbu_id?, role?, is_super_admin? }`

## Email boundary

* email belongs to auth domain
* email must not be added casually to canonical `req.user`
* when backend logic requires user email, use approved retrieval path such as:

  * `rpc('get_my_auth_email')`

## Forbidden

* `req.user.email` as informal convenience truth
* frontend-side identity inference for domain actions

---

# 6. DEV RUNTIME RULES

## Locked dev server rule

In development, SPA fallback must not handle `/api/*`.

In `server/vite.ts`, the catch-all must explicitly exclude API routes.

## Locked mount rule

Do not apply auth middleware broadly at mount level when routers already define `/api/...` endpoints and route-level middleware.

Example of resolved anti-pattern:

* broad `app.use(attachUserContext, financialRoutes)`
* broad `app.use(attachUserContext, governanceRoute)`

These cause root/app interception and break preview/runtime behavior.

## Runtime recovery rule

When runtime behavior contradicts code:

* suspect stale process before redesigning code
* fully kill/restart dev server
* re-test root locally

---

# 7. EXECUTION PROTOCOL

## Mandatory sequence

Search / truth retrieval → inspect → define packet → execute → verify → commit → capture reusable truth

## Packet law

Every meaningful Claude execution must be packet-bounded and define:

* packet ID
* objective
* exact scope
* truths in force
* allowed read files
* allowed write files
* forbidden actions
* expected output
* verification
* rollback condition

## Claude law

Claude executes only.
Claude does not decide truth.

## Review law

No Claude output is trusted until:

* scope verified
* contracts verified
* state mapping verified
* unauthorized assumptions rejected

---

# 8. OPEN BRAIN CAPTURE RULE

Capture only if the truth is:

* verified
* stable
* reusable
* cross-chat relevant

Good capture examples:

* canonical route family
* state machine
* recurring dev-runtime truth
* approved system contracts

Bad capture examples:

* temporary test-user failures
* ambiguous draft fixes
* speculative schema assumptions

---

# 9. GITHUB CHECKPOINT RULE

Commit only:

* bounded, validated changes
* one logical milestone per checkpoint

Checkpoint examples already established:

* governance foundation
* canonical architecture
* runtime contract table
* state machine
* execution governance pack
* MVP system specification
* pending-invitation discovery route
* dashboard canonical discovery alignment
* dev SPA fallback `/api` guard

---

# 10. KNOWN FAILURE PATTERNS

## Pattern 1 — Placeholder execution

Never give Claude placeholders instead of real file content.

## Pattern 2 — Schema guessing

Never assume table or column names without verified truth.

## Pattern 3 — Invalid runtime actors

A failing user without `public.profiles` is not evidence of broken feature logic.

## Pattern 4 — Collapsing error into domain state

Do not map request failure to valid non-member state.

## Pattern 5 — Dev preview false debugging

If preview/root shows auth JSON instead of app shell, inspect:

* SPA fallback
* route mounts
* stale runtime process

## Pattern 6 — Large inline mutation corruption

Large heredoc or whole-file rewrites in Replit may truncate/corrupt.
Prefer:

* backup first
* bounded patching
* chunked writes
* immediate verification

---

# 11. TESTING DOCTRINE

## Runtime validation actor requirement

Valid runtime actor must have:

* valid auth identity
* `public.profiles` row
* expected membership / invitation state for the case being tested

## Current validated truth

* Case A (valid member) has passed
* B/C remain sensitive to actor quality, not necessarily flow correctness

## Strategic rule

Do not let invalid actor quality stall forward system work.

---

# 12. NOTIFICATION SUBSCRIPTION CONTRACT (v1)

## Ownership

Main Hub owns:

* categories
* preferences
* event mapping
* record creation
* delivery orchestration

Gateway may only:

* render preference UI
* consume canonical routes

## Categories

* `ideation_updates`
* `program_updates`
* `invitation_updates`
* `operational_notices`

## Channels

* `in_app`
* `email`

## Defaults

* ideation_updates → in-app OFF, email OFF
* program_updates → in-app ON, email OFF
* invitation_updates → in-app ON, email ON
* operational_notices → in-app ON, email ON

## Event rule

Only canonical backend events may generate notifications.

## Initial route shape

* `GET /api/notifications/preferences`
* `PATCH /api/notifications/preferences`
* `GET /api/notifications`
* `POST /api/notifications/:id/read`

---

# 13. CURRENT PROJECT POSITION

## Already completed

* control-plane docs foundation
* canonical architecture
* runtime contracts
* state machine
* execution governance
* MVP system specification
* canonical pending-invitation backend route
* dashboard alignment to canonical discovery flow
* dev runtime hardening for SPA/API separation
* notification subscription contract approved

## Current strategic reality

* first canonical vertical slice is proven enough to move forward
* invalid test actors are a current testing bottleneck
* do not let actor-quality loops replace system progress

---

# 14. DECISION RULE FOR NEXT STEP

When choosing the next step, prioritize:

1. preserve architectural integrity
2. maximize forward progress
3. avoid invalid-user and unavailable-Supabase traps
4. prefer executable-now work
5. strengthen Main Hub ↔ Gateway synchronization
6. avoid re-opening solved truths

## Mandatory output style for Strategic decisions

* one decision
* why now
* what it unlocks
* exact execution form

No multiple-option drift.

---

# 15. CHAT BOOT INSTRUCTION RULE

New chats should not regenerate system prompts.

Use this pattern:

`SYSTEM SOURCE OF TRUTH: docs/ai/system-control-plane.md`

Then add only:

* role
* immediate task
* any bounded append directive

Prompts are governed references, not regenerated artifacts.

---

END OF CONTROL PLANE
