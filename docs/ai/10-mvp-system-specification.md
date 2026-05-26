# MVP SYSTEM SPECIFICATION — LAMBSBOOK

## PURPOSE
This document consolidates the canonical governance, architecture, runtime contracts, state machine, and execution rules of the Lambsbook Main Hub into one automation-grade MVP system specification.

Its purpose is to allow bounded AI execution and human implementation without ambiguity, semantic drift, or contract mismatch.

---

## SYSTEM GOAL

The MVP system enables a governed invitation-based membership flow in which:

- public users can enter through onboarding surfaces
- authenticated users can be classified correctly as member or non-member
- pending invitations can be discovered canonically
- invite-token flows can be materialized canonically
- invitation acceptance can create/finalize canonical membership
- member-aware surfaces can render only when canonical member truth exists

The system must preserve:
- one truth owner per concept
- one identity path
- one canonical runtime route family
- one canonical membership materialization moment

---

## MVP SCOPE

### Included in MVP
- onboarding entry into canonical membership flow
- authenticated member discovery
- pending invitation discovery
- invite-token materialization flow
- canonical invitation acceptance
- member-aware protected flow after acceptance
- execution governance for AI-assisted implementation
- synchronized truth handling across docs, Open Brain, GitHub, and live backend truth

### Excluded from MVP
- alternate parallel membership systems
- speculative route simplifications not yet verified
- independent Gateway domain authority
- ungoverned frontend-side truth creation
- expanded referral/incentive reinterpretations of invitation meaning
- premature integration of IELTS Engine into automation stack

---

## PRIMARY SYSTEM SURFACES

### 1. Main Hub
Role:
- canonical domain orchestration authority
- owner of runtime contract meaning
- owner of membership and invitation execution semantics

Responsibilities:
- maintain canonical route family
- preserve state-machine integrity
- coordinate AI execution under packet control

---

### 2. Onboarding Gateway
Role:
- presentation and entry surface under Main Hub authority

Responsibilities:
- guide users into canonical flows
- present onboarding and invitation-entry UX
- call only approved runtime contracts
- never create canonical domain truth directly

---

### 3. Supabase
Role:
- canonical backend/data truth

Responsibilities:
- persist schema truth
- enforce policy truth
- execute governed RPC truth
- back canonical membership/invitation data transitions

---

### 4. Open Brain
Role:
- synchronized reusable verified memory

Responsibilities:
- store approved reusable truth
- preserve context, terms, tables, rules, and approved revisions
- support future packet generation and cross-chat continuity

---

### 5. GitHub
Role:
- accepted checkpoint history

Responsibilities:
- preserve approved repository state
- provide restore points
- record accepted design/specification/code milestones

---

## CANONICAL AUTHORITY MODEL

### ChatGPT
- architecture authority
- specification authority
- review authority

### Claude
- bounded execution authority only
- packet-constrained implementation assistant

### Replit
- working execution environment

### Supabase
- live backend/data authority

### Open Brain
- reusable verified-memory authority

### GitHub
- accepted checkpoint authority

Rule:
No layer may silently expand its authority.

---

## CANONICAL ARCHITECTURAL LAW

One identity path.
One truth owner per concept.
One bounded role per layer.
No downstream identity re-resolution.
No silent drift across UX, contracts, code, memory, or backend truth.

---

## CANONICAL RUNTIME CONTRACTS

### Namespace
Canonical membership runtime namespace:
- `/api/member/*`

### Canonical routes in MVP

#### `GET /api/member/me`
Purpose:
- determine whether authenticated user is already a canonical member

Canonical interpretation:
- 200 = member exists
- 404 = canonical member does not yet exist

---

#### `GET /api/member/pending-invitation`
Purpose:
- discover whether authenticated non-member has a pending canonical invitation

Canonical interpretation:
- `{ invitation: null }` = no pending invitation
- `{ invitation: { id } }` = pending invitation exists

---

#### `POST /api/member/materialize-invitation`
Purpose:
- convert invite token into valid invitation materialization context when permitted

Canonical interpretation:
- intermediate step only
- not final membership truth

---

#### `POST /api/member/accept-invitation`
Purpose:
- execute canonical governed invitation acceptance

Canonical interpretation:
- acceptance is the membership materialization/finalization moment

---

## CANONICAL STATE MACHINE

### State A
Unauthenticated visitor

### State B
Authenticated non-member with no pending invitation discovered

### State C
Authenticated non-member with pending invitation discovered

### State D
Authenticated non-member in invite-token materialization flow

### State E
Canonical member exists

---

## CANONICAL FLOWS

### Flow 1 — Member discovery
1. protected/member-aware surface needs canonical user state
2. call `GET /api/member/me`
3. if 200 → State E
4. if 404 → continue
5. call `GET /api/member/pending-invitation`
6. if null → State B
7. if invitation id exists → State C

---

### Flow 2 — Invite-token materialization
1. invite token enters through approved onboarding path
2. user authenticates if not yet authenticated
3. call `POST /api/member/materialize-invitation`
4. if successful, derive canonical invitation context
5. proceed toward governed acceptance
6. if acceptance later succeeds → State E

---

### Flow 3 — Canonical acceptance
1. user is in State C or valid State D-derived context
2. call `POST /api/member/accept-invitation`
3. if success, canonical membership exists
4. future `member/me` resolves 200
5. user is in State E

---

## CANONICAL UX / MEANING RULES

- invitation is not merely marketing language
- acceptance is not a UI illusion
- token presence is not membership
- materialization is not acceptance
- member-aware UX must reflect canonical backend/domain truth
- Gateway may express and guide, but must not materialize domain truth itself

---

## ERROR-HANDLING MODEL

### Fail-closed rule
When truth is unclear, stop and inspect.

### Critical categories
- contract error
- authority error
- identity/auth error
- state-flow error
- execution-scope error
- verification error

### Operational response
- never infer missing truth silently
- never collapse meaningful state distinctions
- never rerun blindly after ambiguous output
- never push mixed unpublished history without inspection

---

## AI EXECUTION MODEL

### Claude usage
Claude may implement only through bounded task packets.

Each packet must include:
- packet ID
- objective
- exact scope
- canonical truths in force
- allowed read files
- allowed write files
- forbidden actions
- expected output
- verification steps
- rollback condition

### Review requirement
No Claude output becomes trusted merely because it compiles or appears plausible.

It must be reviewed against:
- architecture
- contracts
- state machine
- identity/auth discipline
- synchronization duties

---

## SYNCHRONIZATION MODEL

When meaningful approved truth changes:

1. verify actual result
2. review and approve
3. update docs/ai if canonical wording changed
4. capture reusable truth to Open Brain
5. checkpoint accepted repo state in GitHub
6. sync database truth when backend/data truth changed

No partial output becomes authoritative by itself.

---

## RECOVERY MODEL

Before mutation:
- backup exact target files
- log packet execution visibly
- snapshot broader sessions when risk is higher

After approved milestone:
- commit accepted checkpoint
- push only when local history is clean and understood

If output is ambiguous:
- inspect first
- do not rerun blindly

---

## MVP ACCEPTANCE CONDITIONS

The MVP system specification is satisfied only if:

1. authority boundaries remain intact
2. runtime contracts remain canonical and explicit
3. state-machine logic remains canonical and explicit
4. Gateway remains subordinate to Main Hub truth
5. acceptance remains the membership materialization moment
6. AI execution remains packet-bounded
7. synchronization and recoverability rules are followed

---

## MVP IMPLEMENTATION IMPLICATIONS

### Main Hub must provide
- stable canonical route meanings
- stable state-machine interpretations
- stable packet-governance rules
- stable review and synchronization discipline

### Gateway integration must later provide
- surface inventory
- UI-to-state mapping
- bridge/API alignment
- subordinate execution packets under Main Hub authority

### Claude automation may begin only when
- packet is bounded
- relevant truths are already documented
- verification path is known
- rollback path is known

---

## CANONICAL SUMMARY

Lambsbook MVP is a governed invitation-based membership system.

Main Hub is the authority core.
Gateway is the dependent presentation surface.
Supabase is live backend/data truth.
Open Brain stores verified reusable truth.
GitHub stores accepted checkpoints.
Claude executes only under packet control.

The MVP succeeds when users move through canonical states and canonical flows without semantic drift, contract ambiguity, or false domain completion.

