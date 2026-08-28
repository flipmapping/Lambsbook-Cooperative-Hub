# CLAUDE INSTRUCTION BRIEF
# APP-MEMBER-DASH-001 — BUILDER V1.2 — CYCLE 2

Implementation Authority

MAIN_APP

Repository

Main Application / Execution Runtime Repository (APP-RUNTIME-01)

Production Surface

client/src/pages/MemberHub.tsx

Implementation Context Manifest

governance/icm/generated/ICM-APP-REALIZATION-002H.md

Task ID

APP-MEMBER-DASH-001

Cycle

2

Implementation Agent

CLAUDE

Builder

V1.2

## 1. Mission

Complete the existing Member Dashboard MVP as a coherent,
production-safe multi-file surface.

This is a repair/completion cycle, NOT a dashboard rewrite.

Retain the established canonical MemberHub dashboard.

Repair or complete only evidence-backed MVP fractures and unfinished
functionality required by the frozen acceptance contract.

Do not manufacture additional scope merely because technical imperfections
are discovered.

## 2. Canonical Dashboard

CANONICAL_DASHBOARD=/hub/dashboard

CANONICAL_COMPONENT=client/src/pages/MemberHub.tsx

The canonical dashboard is MemberHub.

Do not create, promote, replace, or substitute another dashboard.

Do not delete legacy dashboard files as part of this task.

## 3. Established Member-Domain Authorities

Use the established backend contracts as authoritative.

GET /api/member/me
GET /api/member/recent-participation
GET /api/member/earnings
GET /api/member/pending-invitation
GET /api/member/trusted-relationships
GET /api/member/invitations
GET /api/member/profile/preferences
PUT /api/member/profile/preferences
POST /api/member/invitations
DELETE /api/member/invitations/:id
POST /api/member/accept-invitation

POST /api/member/activity/log
POST /api/member/programs/:id/select
POST /api/member/programs/:id/deselect

Known established facts:

- /api/member/me is a FLAT canonical member projection.
- /api/member/earnings returns an ARRAY.
- /api/member/recent-participation is an established verified contract.
- /api/member/pending-invitation has an established invitation response.
- /api/member/trusted-relationships is the authoritative relationship source.
- invitation lifecycle authority remains in the existing member backend.
- profile preferences remain backend-backed.
- existing participation, program, activity, and earnings capabilities
  remain within their existing authorities.

For pending invitations, the established fields include:

- has_pending_invitation
- invitation.id
- inviter_member_id
- status
- created_at
- invited_email

Do not invent fields, endpoints, RPCs, schemas, authorities, fallback
contracts, or compatibility APIs.

A stale consumer must not become an API requirement.

## 4. Known MVP Repair/Completion Scope

The bounded implementation may address evidence-backed defects/features
within the established MemberHub corridor, including:

- canonical flat member identity consumption;
- invitation contract reconciliation;
- relationship contract reconciliation;
- coherent loading state;
- coherent empty state;
- coherent error state;
- coherent successful-data state;
- already-established unfinished MemberHub MVP functionality;
- stale MemberDashboard wiring only where direct evidence proves it is
  genuinely unused and its removal is required by the canonical dashboard
  contract.

Do NOT assume that every technical imperfection is an MVP defect.

Every mutation must satisfy the frozen MVP acceptance criteria.

## 5. First-Principles Decision Discipline

Before mutation, perform a bounded decision comparison for each candidate:

CURRENT_IMPLEMENTATION
KNOWN/REPORTED_FRACTURE
EXISTING_PLANNED_FIX
FIRST-PRINCIPLES / BEST-PRACTICE_ALTERNATIVE
COMPARISON
CHOSEN_IMPLEMENTATION
RATIONALE
MVP_VALUE

The existing plan is evidence, not an unquestionable specification.

Select the smallest safe implementation that:

- produces observable MVP/user value;
- uses an already-established authoritative contract;
- repairs the defect at the existing consumer boundary where possible;
- preserves domain ownership;
- preserves authorization;
- minimizes mutation;
- avoids unnecessary architecture.

This is a decision discipline, not permission for broad discovery.

Do not restart architectural discovery.

## 6. Mutation Boundary

Primary authorized surface:

client/src/pages/MemberHub.tsx

Conditional authorized surface:

client/src/App.tsx

App.tsx may be changed only if direct evidence proves the stale
MemberDashboard import is genuinely unused and its removal is necessary
for the canonical dashboard contract.

Additional directly coupled files may be changed ONLY when evidence proves:

- the file is directly coupled to the frozen MVP defect/feature;
- mutation is genuinely required;
- the defect cannot safely be repaired at the existing boundary;
- no ownership collision exists.

For every changed file report:

FILE=
DEFECT_OR_FEATURE=
AUTHORITATIVE_EVIDENCE=
USER_IMPACT=
ACCEPTANCE_CRITERION=
WHY_MUTATION_REQUIRED=

No broad refactoring.
No speculative cleanup.
No architecture migration.

## 7. Protected Surfaces

DO NOT MODIFY:

server/routes/member (copy).ts
client/src/pages/member/MemberDashboard.tsx

DO NOT DELETE:

client/src/pages/MemberDashboard.tsx

DO NOT REOPEN:

APP-REC-029R1

DO NOT MODIFY:

- authentication/session architecture;
- JWT/session handling;
- database schema;
- RLS;
- financial architecture;
- Organization Studio;
- backend architecture.

server/routes/member.ts is READ-ONLY.

If a genuine backend contradiction is demonstrated:

STOP BEFORE BACKEND MUTATION.

Return:

BACKEND_CONTRADICTION=YES
CONTRADICTION=
EVIDENCE=
AFFECTED_CONTRACT=
PROPOSED_NEXT_INSPECTION=

Do not modify the backend.

## 8. Concurrent-WIP Protection

Protect all concurrent WIP.

Never:

- stash;
- reset;
- revert;
- clean;
- overwrite;
- absorb;
- stage;
- commit;
- push;
- deploy.

Do not erase or normalize unrelated work.

If a required mutation file contains unrelated pre-existing WIP:

COLLISION=YES

STOP before mutation and identify the exact file and conflicting state.

Do not resolve the collision.

The untracked:

server/routes/member (copy).ts

is protected WIP and is NOT part of this task.

## 9. Acceptance Criteria

A = CANONICAL_ENTRY

/hub/dashboard resolves to the canonical MemberHub dashboard.

B = CANONICAL_IDENTITY

MemberHub consumes the established flat /api/member/me projection without
inventing a nested compatibility contract.

C = NAVIGATION

Authenticated member workspace navigation remains coherent.

D = INVITATIONS

Invitation creation/history/pending/acceptance remains coherent using the
existing invitation lifecycle authority.

E = RELATIONSHIPS

Relationship presentation consumes the authoritative trusted-relationships
data and does not expose UUIDs as the member-facing identity mechanism.

F = RUNTIME_STATES

MVP-critical MemberHub surfaces distinguish applicable loading, empty,
error, and success states.

G = EXISTING_CAPABILITIES

Existing profile, program, activity, participation, membership, and earnings
capabilities remain functional within their established contracts.

H = AUTHORITY

Domain authority remains outside frontend React state.

I = PROTECTED_SURFACES

Protected files and protected architectures remain untouched.

J = SCOPE

Every changed file is directly justified against the frozen MVP contract.

## 10. Out of Scope

Do not implement:

- dashboard replacement;
- legacy dashboard deletion;
- authentication/session redesign;
- JWT changes;
- schema/RLS changes;
- backend redesign;
- invitation-authority redesign;
- relationship persistence redesign;
- membership persistence redesign;
- financial architecture changes;
- Organization Studio;
- notification architecture;
- speculative future features;
- broad refactoring;
- unrelated cleanup;
- APP-REC-029R1 reopening.

## 11. Implementation Requirement

This is an ACTUAL implementation task.

Do not merely return a plan.

After bounded preflight and first-principles comparison, implement every
candidate that satisfies the mutation rule.

Do not manufacture defects.

Do not stop at diagnosis when an authorized evidence-backed repair can be
implemented safely.

If a candidate is uncertain, DEFER it rather than mutate.

## 12. Validation Boundary

After authorized mutation, perform only bounded local validation relevant
to this task.

Return:

EXACT_CHANGED_FILES=
UNIFIED_DIFF=
CONTRACT_TO_CHANGE_MAPPING=
COMPILER_EVIDENCE=
RELEVANT_TEST_EVIDENCE=
ACCEPTANCE_STATUS=
DEFERRED_OPEN_ITEMS=
COLLISION_STATUS=
BLOCKERS=

Do not claim production runtime verification from source inspection.

Founder-controlled runtime verification is subsequent.

## 13. Completion Evidence

Return explicit PASS/FAIL for:

A=CANONICAL_ENTRY
B=CANONICAL_IDENTITY
C=NAVIGATION
D=INVITATIONS
E=RELATIONSHIPS
F=RUNTIME_STATES
G=EXISTING_CAPABILITIES
H=AUTHORITY
I=PROTECTED_SURFACES
J=SCOPE

Also return:

FIRST_PRINCIPLES_DECISIONS=
CHANGED_FILES=
CONTRACT_TO_CHANGE_MAPPING=
COMPILER_EVIDENCE=
RELEVANT_TEST_EVIDENCE=
DEFERRED_OPEN_ITEMS=
COLLISION_STATUS=
BLOCKERS=

If runtime was not exercised:

RUNTIME_MEMBER_FLOW=NOT_EXECUTED
RUNTIME_INVITATION_FLOW=NOT_EXECUTED
RUNTIME_RELATIONSHIP_FLOW=NOT_EXECUTED

## 14. Hard Stops

STOP at the first contradiction involving:

- authoritative API contract;
- protected surface;
- backend mutation;
- concurrent WIP;
- missing required contract information;
- authentication/session architecture;
- schema/RLS;
- financial architecture;
- Organization Studio;
- APP-REC-029R1;
- scope beyond this frozen MVP.

When stopped, report exact evidence.

## 15. Final Boundary

Do not commit.
Do not push.
Do not deploy.

The implementation agent must return evidence for Founder/Main App review.

END_CIB
