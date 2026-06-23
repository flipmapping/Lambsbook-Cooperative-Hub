# FOUNDER-CONVERGENCE MUTATION SURFACE REPORT v2

## 1. Founder Required Capabilities

- Token Resolution
- Token Validation
- Token Authorization
- Token Consumption

## 2. Current Runtime Authority

POST /api/member/accept-invitation
    ↓
invitationId
    ↓
accept_member_invitation RPC

## 3. Runtime Divergence

Current runtime accepts invitationId.

Founder intent requires token-driven invitation lifecycle.

## 4. Mutation Surfaces

### Routes
server/routes/member.ts

### Client
client/src/components/dashboard/InvitationAcceptanceSection.tsx

### Database
member_invitations

### RPC
accept_member_invitation

## 5. Dependencies

- Preserve existing invitation acceptance authority.
- Introduce founder-required token lifecycle.
- Maintain authorization boundary.

## 6. Risk Assessment

LOW
- Client payload updates

MEDIUM
- Route contract updates

HIGH
- RPC behavior changes
- Invitation consumption logic

## 7. Smallest Deployable Mutation Package

Phase 1
- Token Resolution

Phase 2
- Token Validation

Phase 3
- Token Authorization

Phase 4
- Token Consumption

No unrelated onboarding work.
No dashboard redesign.
No governance changes.
