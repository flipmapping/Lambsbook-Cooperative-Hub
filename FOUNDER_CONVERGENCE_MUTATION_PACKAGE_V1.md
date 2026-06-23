# FOUNDER CONVERGENCE MUTATION PACKAGE V1

## Founder Requirement

Invitation lifecycle must operate through:

1. Token Resolution
2. Token Validation
3. Token Authorization
4. Token Consumption

---

## Current Runtime

GET /api/member/pending-invitation
    ↓
returns invitation.id

POST /api/member/accept-invitation
    ↓
receives invitationId

accept_member_invitation RPC
    ↓
membership activation

---

## Divergence

Current runtime is invitationId driven.

Founder requirement is token driven.

---

## Mutation Boundary

### Route

server/routes/member.ts

Endpoints:

GET /api/member/pending-invitation

POST /api/member/accept-invitation

POST /api/member/invitations

---

### Client

client/src/components/dashboard/InvitationAcceptanceSection.tsx

Current payload:

{
  invitationId
}

Target payload:

Founder-convergent invitation token payload.

---

### Database Authority

member_invitations

Verified live authority.

---

### RPC Authority

accept_member_invitation

Verified live authority.

Behavior not yet certified.

---

## Required Runtime Behavior

### Token Resolution

Resolve invitation from invitation token.

### Token Validation

Validate:

- exists
- active
- pending
- not revoked
- not consumed

### Token Authorization

Validate authenticated user may consume token.

### Token Consumption

Successful acceptance permanently consumes token.

---

## Dependencies

1. Preserve existing authorization boundary.

2. Preserve invitation ownership.

3. Preserve membership activation path.

4. Preserve existing acceptance semantics.

---

## Risk

LOW
- client contract

MEDIUM
- route contract

HIGH
- RPC authority
- invitation lifecycle

---

## Acceptance Criteria

A valid token:

- resolves
- validates
- authorizes
- consumes
- activates membership

An invalid token:

- fails safely

A consumed token:

- cannot be reused

A revoked token:

- cannot be consumed

---

## Smallest Deployable Package

Phase 1
Token Resolution

Phase 2
Token Validation

Phase 3
Token Authorization

Phase 4
Token Consumption

