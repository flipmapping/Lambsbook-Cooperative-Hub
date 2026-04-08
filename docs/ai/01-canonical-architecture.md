# CANONICAL ARCHITECTURE — LAMBSBOOK

## PURPOSE
This document defines the settled architecture boundaries, truth owners, and system operating rules for Lambsbook.

Only stable, approved architecture truth belongs here.

---

## CORE ARCHITECTURAL LAW

One identity path.
One truth owner per concept.
One bounded role per layer.
No downstream re-resolution of identity.
No silent drift across Gateway, Hub, memory, code, or data.

---

## PRIMARY SYSTEM SURFACES

### 1. Onboarding Gateway
Role:
- presentation and entry surface
- onboarding experience
- invitation-entry UX
- pre-domain interaction surface

Allowed:
- collect user input
- express approved UX flows
- call approved backend surfaces through defined contracts
- present multilingual and A/B-tested content within approved rules

Forbidden:
- creating canonical membership truth directly
- redefining invitation meaning
- bypassing Hub authority
- inventing backend/domain logic

---

### 2. Main Hub / Backend Authority
Role:
- canonical domain orchestration
- membership and invitation runtime authority
- governed API and backend execution layer

Allowed:
- implement domain logic through approved routes and governed functions
- enforce authority boundaries
- orchestrate approved flows
- expose only canonical runtime surfaces

Forbidden:
- duplicating frontend semantics as truth
- bypassing governed backend rules
- fragmenting runtime contracts across parallel route families

---

### 3. Supabase
Role:
- canonical backend/data authority
- schema, policy, RPC, and persisted truth layer

Allowed:
- hold canonical schema truth
- enforce policy truth
- execute governed RPCs
- persist canonical backend/data state

Forbidden:
- being bypassed by assumption-driven frontend logic
- being contradicted by inferred documentation claims
- having domain truth duplicated casually elsewhere

---

### 4. ChatGPT Authority Layer
Role:
- architecture authority
- specification authority
- review authority

Allowed:
- define settled architecture
- define contracts and state rules
- review execution outputs
- reject drift

Forbidden:
- treating unverified code as truth
- silently changing approved architecture

---

### 5. Claude Execution Layer
Role:
- bounded implementation executor

Allowed:
- execute approved packets only

Forbidden:
- architecture design
- truth ownership decisions
- contract invention
- semantic drift

---

### 6. Open Brain
Role:
- synchronized verified memory layer

Allowed:
- store approved reusable truths
- store definitions, rules, tables, and approved revisions

Forbidden:
- acting as source of live runtime truth
- storing unverified or contradictory architecture

---

### 7. GitHub
Role:
- accepted checkpoint and audit history

Allowed:
- preserve approved repository states
- provide durable restore points

Forbidden:
- substituting for live truth
- substituting for Open Brain memory
- legitimizing unreviewed changes merely because they were committed

---

## CANONICAL BOUNDARIES

### Identity boundary
Canonical identity is resolved once through the approved identity path.

Rule:
- identity must not be re-resolved downstream
- downstream layers consume canonical request identity, not reconstruct it

---

### Domain boundary
Membership, invitation, collaboration, and related domain concepts must be owned by their canonical backend/domain truth paths.

Rule:
- presentation surfaces do not create domain truth
- domain truth is materialized only through governed backend/database mechanisms

---

### Email boundary
Email belongs to the auth domain boundary and must not casually become a domain identity substitute.

Rule:
- email must not be treated as canonical member identity
- domain relationships remain member-based, not email-based

---

### Gateway vs Hub boundary
Gateway expresses experience.
Hub owns canonical domain execution.

Rule:
- Gateway may guide, collect, display, and route
- Hub owns membership and invitation truth

---

### Memory boundary
Open Brain stores reusable verified truth.
It does not replace:
- docs/ai
- GitHub
- Supabase
- live code inspection

---

## CANONICAL REQUEST / EXECUTION SHAPE

Approved flow:
Transport → Identity → Access → Domain → Execution → Composition

Rules:
- no downstream identity re-resolution
- no route-local re-invention of canonical context
- no business truth created in presentation layers
- no composition logic masquerading as domain authority

---

## SINGLE-OWNER RULE

Each concept must have one primary truth owner.

Examples:
- architecture doctrine → docs/ai + approved review authority
- live schema/policy truth → Supabase
- accepted code state → GitHub
- reusable approved memory → Open Brain
- bounded implementation work → Claude under packet control

No concept may have parallel competing authorities.

---

## DRIFT PREVENTION RULE

If any proposal, code change, or AI output would:
- shift truth ownership
- widen Gateway authority
- create parallel runtime contracts
- weaken identity discipline
- confuse email and member identity
- create undocumented backend behavior

then STOP and resolve before proceeding.

---

## CANONICAL SUMMARY

Gateway = presentation and entry.
Hub = domain orchestration.
Supabase = backend/data truth.
ChatGPT = architecture/spec/review authority.
Claude = bounded execution engine.
Open Brain = verified reusable memory.
GitHub = accepted checkpoint history.

