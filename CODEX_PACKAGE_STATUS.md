# CODEX PACKAGE STATUS

## Repository Acquisition

COMPLETE

Files:

client/src/App.tsx
client/src/components/dashboard/InvitationAcceptanceSection.tsx
client/src/pages/dashboard/InvitationAcceptancePage.tsx
client/src/pages/HubDashboard.tsx
client/src/pages/MemberDashboard.tsx
client/src/pages/MemberHub.tsx
server/lib/supabase-dal.ts
server/lib/supabaseClients.ts
server/routes/member.ts
server/routes.ts

## External Authorities

member_invitations
accept_member_invitation

Status:
NOT YET EXPORTED

## Decision Gate

If authority exports obtained:
  Include in Codex package.

If authority exports unavailable:
  Freeze package and mark both authorities as immutable external contracts.

## Founder Architecture (LOCKED)

Invite Token:
  onboarding authorization mechanism

NOT:
  canonical membership authority

Canonical Membership Authority:

member_invitations
+
accept_member_invitation

Codex must preserve both authorities.

Codex must not redesign architecture.

Codex must produce convergence planning only.
