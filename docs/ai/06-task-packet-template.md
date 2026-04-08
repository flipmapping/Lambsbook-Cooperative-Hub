# TASK PACKET TEMPLATE — LAMBSBOOK

## PURPOSE
This template defines the mandatory structure for all bounded execution packets used by Claude or other controlled implementation agents.

Packets must be precise enough to prevent scope drift and semantic ambiguity.

---

## REQUIRED PACKET STRUCTURE

### 1. Packet ID
Format:
- short unique identifier
Examples:
- HUB-UX-001
- HUB-API-004
- GATEWAY-UI-002

Purpose:
- traceability across execution, review, and Open Brain capture

---

### 2. Objective
State one clear goal only.

Good:
- wire dashboard member discovery to canonical pending-invitation route

Bad:
- improve dashboard, fix invitations, and clean up related files

Rule:
- one packet = one primary objective

---

### 3. Exact Scope
State exactly what the packet is allowed to do.

Include:
- which surface/layer it belongs to
- which behavior is being changed
- what remains out of scope

Rule:
- scope must be narrow enough to verify quickly

---

### 4. Canonical Truths in Force
List only the relevant truths that must constrain the packet.

Examples:
- canonical route family is `/api/member/*`
- acceptance is the membership materialization moment
- Gateway is presentation-only
- member/me 404 is non-member, not generic fatal error

Rule:
- only include truths relevant to this packet

---

### 5. Allowed Read Files
List exact files Claude may inspect.

Rule:
- avoid open-ended repository-wide permission unless explicitly necessary

---

### 6. Allowed Write Files
List exact files Claude may modify.

Rule:
- if a file is not listed, it must not be changed

---

### 7. Forbidden Actions
List explicit things Claude must not do.

Examples:
- do not create new endpoints
- do not rename concepts
- do not change backend contract
- do not widen gateway authority
- do not modify auth behavior

Rule:
- forbidden actions must reflect actual drift risks for the packet

---

### 8. Expected Output
State what successful completion looks like.

Examples:
- dashboard now routes non-member users with pending invitations into canonical acceptance path
- no change to route contracts
- no change to token semantics

Rule:
- success must be observable and testable

---

### 9. Verification Steps
State exactly how the output will be checked.

Include as relevant:
- diff inspection
- file inspection
- build/typecheck
- route behavior check
- state-machine alignment check
- contract check

Rule:
- verification must match the scope

---

### 10. Rollback Condition
State when and how to rollback.

Examples:
- rollback if unauthorized files changed
- rollback if route contract changed
- rollback if build fails
- restore from immediate file backups and reject output

Rule:
- rollback must be concrete, not vague

---

## PACKET QUALITY RULES

A packet is invalid if it:
- has more than one primary objective
- omits canonical truths in force
- does not bound write scope
- lacks forbidden actions
- lacks verification
- cannot be reviewed quickly

---

## MINIMAL EXAMPLE

Packet ID:
- HUB-API-001

Objective:
- add canonical pending invitation discovery bridge for dashboard use

Exact scope:
- create or normalize only the approved bridge route for pending invitation discovery
- do not modify canonical backend semantics

Canonical truths in force:
- `/api/member/*` is canonical
- dashboard discovers member state via member/me then pending-invitation
- Gateway is not domain truth owner

Allowed read files:
- [exact file list]

Allowed write files:
- [exact file list]

Forbidden actions:
- no new backend route family
- no acceptance semantic changes
- no auth contract changes

Expected output:
- bridge route aligns with canonical backend contract and forwards auth correctly

Verification:
- inspect diff
- inspect route file
- run appropriate build/typecheck

Rollback condition:
- rollback if any non-listed file changes or backend contract drifts

---

## CANONICAL SUMMARY

Packets are the execution boundary.

If the packet is weak, execution will drift.
If the packet is precise, execution can be automated safely.

