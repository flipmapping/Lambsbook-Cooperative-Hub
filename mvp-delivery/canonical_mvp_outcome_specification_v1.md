# CANONICAL MVP OUTCOME SPECIFICATION V1

EXECUTIONAL_STATUS:
non-executable

CLASSIFICATION:
canonical-mvp-target-definition

STATUS:
active

---

# PURPOSE

Define the minimum functional cooperative MVP target.

This document defines:
- required user-visible flows
- required runtime states
- required authority boundaries
- required executable surfaces

This document does NOT authorize unrestricted mutation.

---

# MVP SUCCESS CONDITION

A new invited user can:

1. authenticate
2. detect invitation state
3. accept invitation
4. materialize canonical membership
5. enter dashboard
6. receive correct capability surface
7. maintain session continuity
8. avoid mixed-state rendering

without runtime contradiction.

---

# REQUIRED PARTICIPATION STATES

- loading
- unauthenticated
- non_member_no_invitation
- invited_pending_acceptance
- member
- error

Exactly one state may render at a time.

---

# REQUIRED MVP FLOWS

## FLOW 1 — AUTHENTICATION

User signs in.

Identity only.

No membership implied.

---

## FLOW 2 — MEMBERSHIP DISCOVERY

Runtime checks:

1. /api/member/me
2. /api/member/pending-invitation

Runtime determines exactly one participation state.

---

## FLOW 3 — INVITATION ACCEPTANCE

Canonical executable corridor:

POST /api/member/accept-invitation

RPC:
accept_member_invitation

Membership materialization occurs here only.

---

## FLOW 4 — MEMBER DASHBOARD

Canonical member state:
member

Dashboard becomes capability-governed.

No mixed-state rendering.

---

# MVP CRITICAL RUNTIME SURFACES

## CANONICAL

- /api/member/*
- attachUserContext
- accept_member_invitation RPC
- participation-state runtime

## CONTAINED / NON-CANONICAL

- /api/hub/member/*
- transitional auth bridges
- boolean participation collapse
- client-only capability authority

---

# MVP CRITICAL BLOCKERS

- auth corridor legitimacy
- fail-closed participation semantics
- InteractionCapability lineage
- program capability ownership

---

# MVP RESTORATION PRINCIPLE

The MVP restores:
- participation continuity
- invitation continuity
- capability continuity
- runtime continuity

The MVP does NOT require:
- historical UI parity
- governance completion
- architectural perfection
- full operational restoration

Bounded functional continuity takes precedence over historical reconstruction completeness.

---

# POST-MVP WORK

The following are explicitly deferred:

- governance topology cleanup
- archive systems
- registry deduplication
- semantic taxonomy refinement
- historical reconciliation compression
- transitional artifact cleanup

