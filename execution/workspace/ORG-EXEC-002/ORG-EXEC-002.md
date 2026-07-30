# ORG-EXEC-002

Planning Kernel Integration Spike

Mission
-------

Create the smallest possible Organization Studio feature module that
proves the planning kernel can be imported into the production React
application.

Deliverables
------------

client/src/organization/

- OrganizationStudio.tsx
- OrganizationRoutes.tsx
- index.ts

Implementation Rules
--------------------

OrganizationStudio.tsx

- Import planning-kernel modules.
- Do not execute planner logic.
- Render:

    Organization Studio
    Planning kernel successfully linked.

OrganizationRoutes.tsx

- Export the /organization route.

index.ts

- Re-export the Organization module.

Acceptance Criteria
-------------------

- Application builds successfully.
- /organization renders.
- No runtime errors.
- No backend calls.
- No planner execution.

Exit Criteria
-------------

Once this spike succeeds, proceed directly to invoking the Builder planner
inside OrganizationStudio. Do not create additional planning specifications.