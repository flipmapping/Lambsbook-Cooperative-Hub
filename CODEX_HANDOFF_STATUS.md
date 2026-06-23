# CODEX HANDOFF STATUS

Repository Acquisition:
COMPLETE

Architecture:
LOCKED

Invite Token:
Onboarding authorization mechanism

NOT canonical membership authority

Canonical Membership Authority:

member_invitations
+
accept_member_invitation

Repository Files Available:

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

External Authorities:

member_invitations
accept_member_invitation

Authority Definitions:
NOT AVAILABLE

Codex Rules:

Do not redesign architecture.

Do not replace canonical authorities.

Treat external authorities as immutable contracts.

Produce convergence planning only.

No code generation until convergence plan approved.
