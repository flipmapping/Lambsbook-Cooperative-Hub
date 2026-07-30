# ORG-DEMO-004A

Organization Route Module

Mission
-------

Introduce Organization Studio as an isolated feature module.

Repository Truth
----------------

The canonical application uses Wouter and client/src/App.tsx is already
the composition root.

Decision
--------

Do not place Organization Studio implementation directly inside App.tsx.

Instead create:

client/src/organization/
    OrganizationRoutes.tsx
    OrganizationStudio.tsx

Responsibilities
----------------

OrganizationRoutes.tsx
- Own all /organization routes.
- Export route components only.

OrganizationStudio.tsx
- Consume the existing Builder planning kernel.
- Display:
  * Builder demo scenario
  * Planning validation
  * Execution plan

Constraints
-----------

No backend mutation.

No runtime execution.

No API changes.

No changes to the Builder planning kernel.

Acceptance Criteria
-------------------

App.tsx integrates Organization Studio through a single imported route
module, preserving the composition-root boundary and keeping future
Builder features encapsulated.