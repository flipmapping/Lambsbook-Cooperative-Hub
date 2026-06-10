# CANONICAL MEMBERSHIP RUNTIME CONTRACT TABLE
#
# RULE:
# Every row must be traceable to extracted evidence.
#
# Sources:
# membership_runtime_backend_contract.log
# membership_dependency_chain.log
# membership_client_contract.log

| CLIENT_PAGE | API_ENDPOINT | AUTH_CHAIN | ROUTE_HANDLER | RPCS | TABLES | DAL_METHODS | RESPONSE | NEXT_STATE | EVIDENCE_SOURCE |
|-------------|-------------|------------|---------------|------|--------|-------------|----------|------------|-----------------|

| MemberDashboard; HubDashboard; MemberHub |
| GET /api/member/me |
| Authorization Header → attachUserContextSafe → attachUserContext → auth.getUser → profiles → req.user |
| router.get("/me") |
| NONE |
| profiles; meh.members |
| getMemberByUserId |
| {id,membership_status,member_type,activity_status} |
| member loaded OR member not found |
| membership_runtime_backend_contract.log; membership_dependency_chain.log; membership_client_contract.log |

| MemberDashboard; HubDashboard |
| GET /api/member/pending-invitation |
| Authorization Header → attachUserContextSafe → attachUserContext |
| router.get("/pending-invitation") |
| get_my_auth_email |
| member_invitations |
| NONE |
| {has_pending_invitation,invitation} |
| invitation discovered OR none present |
| membership_runtime_backend_contract.log; membership_dependency_chain.log; membership_client_contract.log |

| Evidence Not Yet Proven |
| POST /api/member/invitations |
| Authorization Header → attachUserContextSafe → attachUserContext |
| router.post("/invitations") |
| issue_member_invitation |
| RPC-owned |
| NONE |
| {invitation} |
| invitation issued |
| membership_runtime_backend_contract.log; membership_dependency_chain.log |

| InvitationAcceptancePage; InvitationAcceptanceSection; MemberDashboard |
| POST /api/member/accept-invitation |
| Authorization Header → attachUserContextSafe → attachUserContext |
| router.post("/accept-invitation") |
| accept_member_invitation |
| RPC-owned |
| NONE |
| {success:true} |
| member activated |
| membership_runtime_backend_contract.log; membership_dependency_chain.log; membership_client_contract.log |

| MemberHub |
| GET /api/member/trusted-relationships |
| Authorization Header → attachUserContextSafe → attachUserContext |
| router.get("/trusted-relationships") |
| NONE |
| meh.members; collaborations |
| getMemberByUserId; getMemberById; getDirectInvitees |
| {invitor,invitees} |
| relationship graph rendered |
| membership_runtime_backend_contract.log; membership_dependency_chain.log; membership_client_contract.log |

| MemberHub |
| GET /api/member/recent-participation |
| Authorization Header → attachUserContextSafe → attachUserContext |
| router.get("/recent-participation") |
| NONE |
| activity_logs; meh.members |
| getMemberByUserId; getActivityLogsByMember |
| {activity_status,last_activity_at,recent_logs} |
| participation dashboard rendered |
| membership_runtime_backend_contract.log; membership_dependency_chain.log; membership_client_contract.log |

