# APP-REC-005 Implementation Specification

## Authority
FAB-APP-RUNTIME-01E

## Repository Evidence

Mutation source:
- generate_stage1_patch.py

Acceptance criteria:
- verify_stage1_gate.py

## Target

client/src/pages/MemberHub.tsx

## Authorized Mutation

For the following queries only:

- /api/member/recent-participation
- /api/member/earnings
- /api/member/pending-invitation
- /api/member/trusted-relationships

replace:

    enabled: isAuthenticated

with:

    enabled: isAuthenticated && !profileLoading && !!profile

## Explicit Prohibitions

Do NOT modify:

- /api/member/me
- Authentication
- Routing
- attachUserContext
- dashboardAdapter.ts
- RuntimeNavigationPolicy

No additional mutations are authorized.

## Verification

python3 execution/sprints/APP-REC-005/verify_stage1_gate.py
