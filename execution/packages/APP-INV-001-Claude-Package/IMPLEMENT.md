# APP-INV-001 — IMPLEMENTATION REQUEST

## STATUS

EXECUTE AFTER PIC PACKAGE SYNCHRONIZATION

## AUTHORITY

APP-INV-001

## INPUT

Certified APP-INV-001 PIC package.

## OBJECTIVE

Restore the canonical Invitation + Relationship production journey:

Invitation URL
→ signup
→ account creation
→ authentication/session
→ canonical identity
→ invitation continuation/materialization
→ invitation acceptance
→ Member Dashboard invitation state
→ Relationship tab

## EXECUTION RULES

1. Synchronize with Repository Truth before mutation.
2. Inspect the complete implementation context supplied by the PIC.
3. Mutate only the authorized APP-INV-001 production corridor.
4. Preserve authentication and identity resolution.
5. Preserve canonical membership authority.
6. Preserve authorization and RLS boundaries.
7. Do not create duplicate invitation, membership, relationship, or Community authorities.
8. Do not implement Matrix provider functionality.
9. Make the minimum repository mutation necessary.
10. Do not perform unrelated cleanup or refactoring.

## AUTHORIZED PRODUCTION MUTATION CORRIDOR

- client/src/pages/dashboard/InvitationAcceptancePage.tsx
- client/src/pages/HubAuth.tsx
- client/src/pages/HubAuthCallback.tsx
- client/src/App.tsx
- client/src/pages/MemberHub.tsx
- web/src/components/dashboard/RelationshipTrustSection.tsx
- server/routes/member.ts
- server/routes.ts
- server/services/supabase-hub.ts

## REQUIRED EVIDENCE

- Unified source diff
- Build evidence
- Authentication/session evidence
- Canonical identity evidence
- Invitation URL evidence
- Signup continuation evidence
- Invitation materialization evidence
- Invitation acceptance evidence
- Member Dashboard invitation-state evidence
- Trusted-relationship API evidence
- Relationship tab evidence
- Production-browser evidence
- Production SHA

## STOP CONDITIONS

Stop and report if a required authority or dependency is absent.

Do not independently redefine a missing contract.

Do not broaden the mutation corridor.

## RETURN

Return only:

1. Files changed
2. Mutation summary
3. Build evidence
4. Runtime evidence
5. Invitation evidence
6. Relationship evidence
7. Production evidence
8. Remaining gap
