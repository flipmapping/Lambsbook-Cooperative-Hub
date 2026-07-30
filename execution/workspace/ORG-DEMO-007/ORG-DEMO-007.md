# ORG-DEMO-007

Organization Validation Boundary

Mission
-------

Introduce a validation layer between the founder conversation and the
Organization Composer.

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
OrganizationValidator
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

OrganizationValidator
- Validate OrganizationDraft.
- Return validation result and errors.
- No composition.
- No planning.
- No runtime calls.

OrganizationComposer
- Accept only validated drafts.
- Produce OrganizationManifest.

Acceptance Criteria
-------------------

Invalid drafts never reach OrganizationComposer.

Validation, composition, and planning remain independently testable.

After ORG-DEMO-007, begin implementation of the Organization Studio UI rather
than introducing additional architectural layers.