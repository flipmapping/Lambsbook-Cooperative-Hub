# ORG-EXEC-001

Organization Studio Shell Materialization

Mission
-------

Implement the smallest executable Organization Studio that proves the
planning kernel works inside the production React application.

Implementation

Create:

client/src/organization/
    OrganizationStudio.tsx
    OrganizationRoutes.tsx
    index.ts

Responsibilities
----------------

OrganizationStudio.tsx

- Import the Builder demo scenario.
- Invoke the existing Builder planner.
- Render:
  * Demo scenario
  * Organization manifest summary
  * Execution plan

OrganizationRoutes.tsx

- Export the /organization route.

index.ts

- Export the Organization module public API.

Integration
-----------

Register:

    /organization

through the existing Wouter router.

Constraints
-----------

- No backend changes.
- No database access.
- No authentication changes.
- No AI conversation.
- No persistence.
- Reuse the certified planning kernel exactly as-is.

Acceptance Criteria
-------------------

Visiting /organization renders a functioning Organization Studio shell
that demonstrates the Builder planning pipeline using the existing demo
scenario.