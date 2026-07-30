# Production Implementation Capsule

Implementation Authority:
GEX-001M-55

Purpose

This capsule contains everything required to implement the
canonical CSV persistence capability.

Authorized Mutation

Modify ONLY:

server/imports/pipeline/persist.ts

Repository Surfaces

persist.ts
    Target implementation.

contracts.ts
    Canonical pipeline contracts.

prospectRegistration.ts
    Canonical CSV → Registration mapper.

admissions.ts
    Canonical persistence service.

CLAUDE_IMPLEMENTATION_BRIEF.md
    Primary implementation instructions.

IMPLEMENTATION_CONTEXT.md
    Architectural context.

implementation-authority.json
    Certified execution authority.

execution-state.json
    Current execution state.

Out of Scope

- runImportPipeline() integration
- Resend onboarding
- Zalo onboarding

Those belong to the next execution sprint.

Expected Deliverable

- Completed persist.ts
- Successful build
- Ready for runImportPipeline() integration