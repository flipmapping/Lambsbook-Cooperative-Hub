# APP-MEMBER-DASH-001 — CYCLE 2 — FINAL IMPLEMENTATION MANIFEST

IMPLEMENTATION_MANIFEST=READY
TASK_ID=APP-MEMBER-DASH-001
CYCLE=2
IMPLEMENTATION_AUTHORITY=MAIN_APP
IMPLEMENTATION_AGENT=CLAUDE
BUILDER=V1.2

## 1. PURPOSE

This manifest is the bounded implementation contract for the Claude
implementation step.

It preserves the Founder-approved APP-MEMBER-DASH-001 architecture and
acceptance boundary.

The manifest is an implementation constraint/evidence artifact. It is NOT
Repository Truth. Claude MUST verify relevant claims against current
Repository Truth during bounded implementation preflight.

This is a repair/completion cycle, NOT a dashboard rewrite.

## 2. CANONICAL SURFACE

CANONICAL_DASHBOARD=/hub/dashboard
CANONICAL_COMPONENT=client/src/pages/MemberHub.tsx

The current routing evidence establishes that client/src/App.tsx is the
Wouter router and that /hub/dashboard already routes to MemberHub.

Therefore:

ROUTING=NO_MUTATION
APP_TSX=NO_MUTATION

Do not create, promote, replace, or substitute another dashboard.

## 3. EXACT AUTHORIZED IMPLEMENTATION SURFACE

AUTHORIZED_FILES=
  client/src/pages/MemberHub.tsx

This is the authorized implementation surface subject to the rule that
EVERY individual mutation must be independently justified by the evidence
and acceptance criteria below.

No additional file is authorized merely because it is technically coupled.

If implementation evidence proves another file is genuinely required,
STOP before modifying that file and report:

FILE=
DEFECT_OR_FEATURE=
AUTHORITATIVE_EVIDENCE=
ACCEPTANCE_CRITERION=
WHY_MUTATION_REQUIRED=

No speculative expansion is authorized by this manifest.

## 4. FORBIDDEN / READ-ONLY SURFACES

FORBIDDEN_FILES=
  client/src/App.tsx
  server/routes/member (copy).ts
  client/src/pages/member/MemberDashboard.tsx
  client/src/pages/MemberDashboard.tsx

READ_ONLY_FILES=
  server/routes/member.ts

server/routes/member.ts has pre-existing worktree modification.
It remains read-only for this implementation.

server/routes/member (copy).ts is protected pre-existing untracked WIP.
It MUST NOT be modified, staged, cleaned, reverted, or absorbed.

Do not delete client/src/pages/MemberDashboard.tsx.

## 5. FROZEN AUTHORITATIVE CONTRACTS

Use the established backend implementations as authoritative.

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

Established contract evidence supplied for this cycle includes:

- /api/member/me is a FLAT canonical member projection.
- /api/member/earnings returns an ARRAY.
- /api/member/recent-participation is established.
- /api/member/pending-invitation has an established response shape.
- /api/member/trusted-relationships is the authoritative relationship source.
- invitation lifecycle authority remains in the existing backend.
- profile preferences remain backend-backed.
- participation, program, activity, and earnings capabilities remain within
  their existing authorities.

Do not invent fields, endpoints, RPCs, schemas, compatibility APIs, fallback
authorities, or frontend-owned domain state.

## 6. EXACT CYCLE-2 MUTATION INVENTORY

### MUTATION 1 — CANONICAL MEMBER IDENTITY

FILE=
client/src/pages/MemberHub.tsx

CURRENT_BEHAVIOR=
MemberHub contains member identity/membership consumption assumptions that
treat /api/member/me as a nested identity/membership structure.

AUTHORITATIVE_EVIDENCE=
The established /api/member/me contract is a flat canonical member
projection.

SEMANTIC_DEFECT=
The consumer does not consistently consume the established flat projection,
creating an identity/membership presentation mismatch.

CHOSEN_CHANGE=
Reconcile the MemberHub member identity and membership projection with the
actual flat /api/member/me response without changing the backend contract.

WHY_THIS_IS_MINIMUM_SAFE=
The defect exists at the existing consumer boundary. No new API, adapter,
backend change, schema change, or new authority is required.

MVP_ACCEPTANCE_CRITERION=
MemberHub presents the authenticated member's canonical identity and
membership information from the established flat /api/member/me projection.

USER_VISIBLE_RESULT=
The authenticated member sees correct member identity/membership information
rather than data derived from stale nested response assumptions.

### MUTATION 2 — PENDING INVITATION CONTRACT

FILE=
client/src/pages/MemberHub.tsx

CURRENT_BEHAVIOR=
The MemberHub pending-invitation presentation consumes unsupported/stale
fields including inviter_email and note.

AUTHORITATIVE_EVIDENCE=
The established pending-invitation response does not establish those fields;
the established fields include has_pending_invitation, invitation.id,
inviter_member_id, status, created_at, and invited_email.

SEMANTIC_DEFECT=
The UI depends on fields that are not established by the authoritative
response contract.

CHOSEN_CHANGE=
Reconcile pending-invitation rendering with the established response shape.
Use only fields actually established by the authoritative contract.

WHY_THIS_IS_MINIMUM_SAFE=
The consumer can be corrected without modifying invitation authority or
adding compatibility fields to the backend.

MVP_ACCEPTANCE_CRITERION=
Pending invitation presentation is coherent using only authoritative
pending-invitation data, and invitation acceptance remains connected to the
existing canonical transition.

USER_VISIBLE_RESULT=
A member with a pending invitation sees a coherent invitation state without
unsupported field assumptions.

### MUTATION 3 — BOUNDED REQUEST-STATE SEMANTICS

FILE=
client/src/pages/MemberHub.tsx

CURRENT_BEHAVIOR=
MemberHub has MVP-critical loading/error/empty/success semantics that must be
reconciled where the existing implementation does not correctly communicate
the authoritative request state.

AUTHORITATIVE_EVIDENCE=
The current MemberHub implementation and established endpoint contracts are
the evidence base for determining each concrete state defect.

SEMANTIC_DEFECT=
Only an actual user-visible failure of loading, empty, error, or successful
data semantics qualifies for mutation.

CHOSEN_CHANGE=
Repair only the concrete request-state defects demonstrated by the existing
implementation. Do not introduce a new state-management architecture.

WHY_THIS_IS_MINIMUM_SAFE=
Existing query/mutation infrastructure remains the boundary. The repair is
limited to observable MVP state semantics.

MVP_ACCEPTANCE_CRITERION=
MVP-critical MemberHub requests distinguish applicable loading, empty, error,
and successful states without falsely presenting unavailable or failed data
as successful.

USER_VISIBLE_RESULT=
Members can distinguish waiting for data, no available data, failed
requests, and successfully loaded data.

IMPORTANT=
Do not manufacture a state mutation where the current implementation already
satisfies the semantic requirement.

## 7. AREAS EXPLICITLY NOT AUTHORIZED FOR MUTATION

ROUTING=
NO_MUTATION — /hub/dashboard already routes to MemberHub.

APP_TSX=
NO_MUTATION — no stale-route repair is required by current routing evidence.

EARNINGS=
NO_MUTATION — established array contract is already aligned.

RECENT_PARTICIPATION=
NO_MUTATION unless a concrete MVP defect is independently established during
implementation.

TRUSTED_RELATIONSHIPS=
NO_MUTATION unless a concrete MVP defect is independently established during
implementation.

INVITATION_LIFECYCLE_AUTHORITY=
NO_MUTATION.

PROFILE_BACKEND_AUTHORITY=
NO_MUTATION.

PROGRAM_API=
NO_NEW_API.

ACTIVITY_AUTHORITY=
NO_AUTHORITY_CHANGE.

MEMBERSHIP_AUTHORITY=
NO_AUTHORITY_CHANGE.

RELATIONSHIP_AUTHORITY=
NO_AUTHORITY_CHANGE.

## 8. FIRST-PRINCIPLES DECISION RULE

Before every mutation, Claude MUST compare:

CURRENT_IMPLEMENTATION
vs.
KNOWN_OR_REPORTED_FRACTURE
vs.
EXISTING_PLANNED_FIX
vs.
FIRST_PRINCIPLES_BEST_PRACTICE_ALTERNATIVE

Then select the smallest safe implementation that:

- produces observable MVP value;
- conforms to the authoritative backend contract;
- preserves authorization;
- preserves domain ownership;
- minimizes mutation;
- avoids unnecessary architecture.

Historical plans are evidence, not unquestionable specifications.

Technical cleanliness alone is not an MVP mutation criterion.

## 9. MUTATION JUSTIFICATION REQUIREMENT

For every actual changed file and every material change, record:

CURRENT_BEHAVIOR=
AUTHORITATIVE_EVIDENCE=
SEMANTIC_DEFECT=
CHOSEN_CHANGE=
WHY_THIS_IS_MINIMUM_SAFE=
MVP_ACCEPTANCE_CRITERION=
USER_VISIBLE_RESULT=

If any of these cannot be established:

DO NOT MUTATE.

## 10. BACKEND CONTRADICTION GATE

server/routes/member.ts remains READ_ONLY.

If current Repository Truth demonstrates that an authoritative backend
contract contradicts the established implementation contract:

STOP BEFORE BACKEND MUTATION.

Return:

BACKEND_CONTRADICTION=YES
CONTRADICTION=
EVIDENCE=
AFFECTED_CONTRACT=
WHY_FRONTEND_REPAIR_IS_INSUFFICIENT=

Do not modify the backend.

## 11. CONCURRENT-WIP PROTECTION

Never:

stash
reset
revert
clean
overwrite
absorb
stage
commit
push
deploy

Pre-existing WIP is not disposable.

If client/src/pages/MemberHub.tsx has unrelated pre-existing WIP that
intersects a required mutation:

COLLISION=YES
STOP.

Do not resolve the collision.

server/routes/member.ts is already known to contain pre-existing WIP and is
therefore read-only.

## 12. PROTECTED ARCHITECTURE

Do not modify:

authentication/session architecture
JWT/session handling
database/schema
RLS
financial architecture
Organization Studio
invitation authority
relationship authority
membership authority
backend architecture

APP-REC-029R1=CLOSED

Do not reopen APP-REC-029R1.

## 13. MVP ACCEPTANCE CONTRACT

A=
Canonical /hub/dashboard entry resolves to MemberHub.

B=
MemberHub consumes canonical flat member identity correctly.

C=
Authenticated workspace navigation remains functional.

D=
Invitation creation/history/pending/acceptance remains coherent.

E=
Relationship presentation consumes authoritative relationship data without
UUID leakage.

F=
MVP-critical surfaces distinguish applicable loading/empty/error/success
states.

G=
Existing profile/program/activity/earnings capabilities remain functional.

H=
Domain authority remains outside frontend state.

I=
Protected surfaces remain untouched.

J=
Every changed file and material change is directly justified by the MVP
contract.

## 14. VALIDATION BOUNDARY FOR CLAUDE

After implementation, Claude must return:

EXACT_CHANGED_FILES=
UNIFIED_DIFF=
CONTRACT_TO_CHANGE_MAPPING=
COMPILER_EVIDENCE=
RELEVANT_TEST_EVIDENCE=
ACCEPTANCE_STATUS=
DEFERRED_OPEN_ITEMS=
COLLISION_STATUS=
BLOCKERS=

Production runtime verification is a subsequent Founder-controlled phase.

Claude must not claim production runtime success from source inspection.

## 15. ABSOLUTE OUT-OF-SCOPE

Do not implement:

- dashboard replacement;
- new dashboard architecture;
- backend redesign;
- new member APIs;
- new RPCs;
- schema/RLS changes;
- authentication/session changes;
- financial architecture changes;
- Organization Studio;
- speculative refactoring;
- generic technical-debt cleanup;
- legacy dashboard deletion;
- program functionality unsupported by an established authoritative read
  contract;
- invitation or relationship authority migration.

## 16. IMPLEMENTATION COMPLETION RULE

This manifest authorizes a complete bounded Cycle-2 implementation, not a
partial diagnostic pass.

Claude must implement every mutation that independently satisfies the
mutation rules and frozen MVP acceptance criteria.

Claude must NOT manufacture additional mutations merely because they appear
technically desirable.

If an authorized mutation cannot be safely performed because of a genuine
contradiction or collision:

STOP and return the exact evidence.

## 17. HARD EXECUTION BOUNDARY

This manifest does NOT authorize:

commit
push
deployment
release governance

Those are separate operations.

END_MANIFEST
