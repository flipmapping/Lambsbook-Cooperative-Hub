# APP-INV-001 — Execution Derivation

## Authority

APP-INV-001

## Mission

Restore and complete the canonical Invitation + Relationship production surface as one
bounded implementation corridor.

## Production Journey

Invitation URL
→ signup continuation
→ account creation
→ authentication/session
→ canonical identity
→ invitation materialization/continuation
→ invitation acceptance
→ Member Dashboard invitation state
→ Relationship tab

## Required Implementation Scope

- Repair invitation URL continuation into signup.
- Preserve invitation token through account creation and authentication.
- Materialize the invitation only after authenticated identity exists.
- Resolve the canonical invitation for the authenticated user.
- Complete invitation acceptance through the canonical membership path.
- Expose the resulting invitation state in the Member Dashboard.
- Complete the Relationship tab using the existing trusted-relationship surface.
- Wire existing invitation and relationship capabilities that are present but not connected.
- Preserve canonical identity, membership, authorization, and RLS boundaries.
- Treat the OS-MATRIX-001D Community → Matrix contract as an external governed dependency.
- Do not create a duplicate Community authority.
- Do not implement Matrix provider functionality.

## Authorized Production Surfaces

- client/src/pages/dashboard/InvitationAcceptancePage.tsx
- client/src/pages/HubAuth.tsx
- client/src/App.tsx
- existing canonical Member Dashboard invitation surface
- existing canonical Relationship surface
- existing invitation/member API surfaces required to complete the journey

## Acceptance

The implementation agent must produce evidence that the complete invitation journey
works from a fresh invitee through account creation, authenticated session,
canonical identity, invitation acceptance, Member Dashboard state, and Relationship
tab.

The implementation must preserve existing authentication and authorization behaviour.

## Dependency

OS-MATRIX-001D:
Community → Matrix contract must expose canonical `matrix_room_id` on the existing
Community authority. `matrix_room_url` is derived presentation data unless persistence
is independently proven necessary.

## Out of Scope

- Matrix provider implementation
- duplicate Community models
- unrelated repository cleanup
- database redesign
- RLS weakening
- authentication-provider replacement
