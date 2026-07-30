# ORG-DEMO-004

Organization Studio MVP

Mission
-------

Introduce the first founder-visible Organization Studio route.

Repository Truth
----------------

* Router: Wouter
* Entry: client/src/main.tsx
* App: client/src/App.tsx
* Planning Kernel: shared/organization/*
* Growth runtime initialization already exists.

Required Mutation
-----------------

1. Create:

   client/src/pages/OrganizationStudio.tsx

2. Import the page into:

   client/src/App.tsx

3. Add one Wouter route:

   <Route path="/organization" component={OrganizationStudio} />

4. Render:

   - Builder title
   - Demo scenario
   - Validation output
   - Execution plan

Constraints
-----------

No backend changes.

No database mutations.

No Builder execution.

Reuse the existing planning kernel.

Acceptance Criteria
-------------------

A founder can navigate to:

    /organization

and see the Builder planning demonstration using the existing manifest,
registry, planner and validation components.