# AUTH_RUNTIME_CONTRACT

SOURCE:
membership_runtime_backend_contract.log
membership_dependency_chain.log

VERIFIED_TRUTH:

attachUserContext is the sole identity resolver.

Identity chain:

Authorization Header
→ attachUserContextSafe
→ attachUserContext
→ Supabase auth.getUser()
→ profiles lookup
→ req.user

Canonical req.user shape:

{
  id,
  token,
  sbu_id?,
  role?,
  is_super_admin?
}

attachUserContextSafe behavior:

If Authorization header absent:
  next()

If Authorization header present:
  delegate to attachUserContext

# MEMBERSHIP_RUNTIME_CONTRACT

SOURCE:
membership_runtime_backend_contract.log
membership_dependency_chain.log
membership_client_contract.log

VERIFIED_ENDPOINTS:

GET /api/member/me

GET /api/member/pending-invitation

POST /api/member/invitations

POST /api/member/accept-invitation

GET /api/member/trusted-relationships

GET /api/member/recent-participation

Route registration:

app.use("/api/member", memberRoutes)

# INVITATION_RUNTIME_CONTRACT

SOURCE:
membership_runtime_backend_contract.log
membership_dependency_chain.log

Invitation discovery flow:

GET /api/member/pending-invitation

RPC:
get_my_auth_email

Table:
member_invitations

Invitation acceptance flow:

POST /api/member/accept-invitation

RPC:
accept_member_invitation

Invitation issuance flow:

POST /api/member/invitations

RPC:
issue_member_invitation

# RPC_DEPENDENCY_CONTRACT

SOURCE:
membership_dependency_chain.log

Verified RPCs:

get_my_auth_email

issue_member_invitation

accept_member_invitation

# TABLE_DEPENDENCY_CONTRACT

SOURCE:
membership_dependency_chain.log
membership_runtime_backend_contract.log

Verified tables:

profiles

member_invitations

meh.members

activity_logs

collaborations

# DAL_DEPENDENCY_CONTRACT

SOURCE:
membership_dependency_chain.log

Verified DAL methods:

getMemberByUserId

getMemberById

getDirectInvitees

getActivityLogsByMember

# CLIENT_TO_API_CONTRACT

SOURCE:
membership_client_contract.log

MemberDashboard
→ GET /api/member/me
→ GET /api/member/pending-invitation

HubDashboard
→ GET /api/member/me
→ GET /api/member/pending-invitation

MemberHub
→ GET /api/member/me
→ GET /api/member/recent-participation

InvitationAcceptancePage
→ POST /api/member/accept-invitation

InvitationAcceptanceSection
→ POST /api/member/accept-invitation

