========================================================================
APP-REC-004
LIVE IDENTITY CORRIDOR CERTIFICATION
STATUS: BEGIN
========================================================================

MISSION

Diagnose the authenticated runtime identity corridor using live
founder testing.

SCOPE

Inspect ONLY the production runtime path:

Browser Session
→ Supabase Session
→ Authorization Header
→ attachUserContext
→ req.user
→ getMemberByUserId()
→ /api/member/me
→ MemberHub
→ RuntimeNavigationPolicy
→ Dashboard Selection

OBJECTIVE

Identify the first point where two authenticated users diverge from
the expected identity contract.

NO REPOSITORY MUTATION IS AUTHORIZED.

DELIVERABLE

A certified Runtime Identity Corridor Report identifying the first
verified fracture responsible for incorrect dashboard routing.

========================================================================
