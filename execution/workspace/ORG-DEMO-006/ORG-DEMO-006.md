# ORG-DEMO-006

Organization Composer Boundary

Mission
-------

Introduce an Organization Composer between the founder conversation and the
Builder planning kernel.

Architecture
------------

Founder
    │
    ▼
OrganizationConversation
    │
    ▼
OrganizationDraft
    │
    ▼
OrganizationComposer
    │
    ▼
OrganizationManifest
    │
    ▼
BuilderPlanner
    │
    ▼
ExecutionPlan

Responsibilities
----------------

OrganizationDraft
- Represents founder intent.
- UI-facing model.

OrganizationComposer
- Converts OrganizationDraft into OrganizationManifest.
- Pure deterministic function.
- No runtime calls.
- No routing.
- No planning.

BuilderPlanner
- Consumes OrganizationManifest.
- Produces ExecutionPlan.

Acceptance Criteria
-------------------

The planning kernel receives OrganizationManifest only.

UI components never construct OrganizationManifest directly.

The conversation, composition, and planning layers remain independently testable.