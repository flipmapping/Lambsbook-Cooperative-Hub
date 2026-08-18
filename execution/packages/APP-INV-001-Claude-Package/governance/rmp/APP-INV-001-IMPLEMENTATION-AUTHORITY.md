# APP-INV-001 — Invitation + Relationship Surface Restoration

## Mission

Restore and complete the canonical invitation and relationship journey as one bounded
production surface, replacing fragmented feature-by-feature repairs with one governed
implementation package.

## Authority

APP-INV-001

## Production Surface

Invitation + Relationship Surface

## Canonical Journey

Invitation URL
→ signup continuation
→ account creation
→ authentication/session
→ canonical identity
→ invitation materialization/continuation
→ invitation acceptance
→ Member Dashboard invitation state
→ Relationship tab

## Authorized Inspection Surface

- client/src/pages/dashboard/InvitationAcceptancePage.tsx
- client/src/pages/HubAuth.tsx
- client/src/App.tsx
- server/routes.ts
- server/routes/member.ts
- server/services/supabase-hub.ts
- server/services/supabase-auth.ts
- existing Member Dashboard invitation/relationship components
- existing invitation and trusted-relationship API contracts
- existing repository implementation context required by Builder v1.2

## Authorized Mutation Surface

Only the existing production files required to make the canonical Invitation +
Relationship journey operational end-to-end.

Builder v1.2 and the Implementation Agent shall determine the exact mutation files
from repository truth before mutation.

## Required Outcomes

1. Invitation links preserve their token through the complete signup/authentication
   continuation.
2. A newly created invitee can authenticate successfully.
3. The canonical authenticated identity is established.
4. The invitation is materialized/resolved for the authenticated invitee.
5. The invitee can accept the invitation through the canonical acceptance path.
6. Invitation state is correctly reflected in the Member Dashboard.
7. Existing trusted-relationship data is correctly wired into the canonical
   Relationship surface.
8. Existing invitation/relationship persistence and lifecycle authorities are reused.
9. No duplicate invitation, membership, relationship, or identity authority is created.
10. Existing authenticated-member behaviour remains intact.

## Explicit Non-Goals

- Community → Matrix contract
- OS Matrix implementation
- Matrix provider implementation
- New Community authority
- unrelated dashboard features
- unrelated authentication refactoring
- schema redesign unless existing canonical persistence authority proves a required
  contract gap
- manual production evidence fabrication

## Required Certification Evidence

- unified implementation diff
- build/guard result
- invitation URL continuation proof
- signup success proof
- login/session proof
- canonical identity proof
- invitation materialization proof
- invitation acceptance proof
- Member Dashboard invitation-state proof
- Relationship surface proof
- exact deployed revision SHA
- production browser smoke evidence

## Governance

This authority is the single implementation boundary for APP-INV-001.
Do not perform isolated invitation or relationship feature mutations outside this
authority.

The implementation must be materialized through Builder v1.2 and its Implementation
Agent workflow.

## Acceptance

APP-INV-001 is complete only when the complete canonical journey is operational in
the deployed production revision and the required browser evidence is captured.
