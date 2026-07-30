# ORG-DEMO-005

Founder Conversation Surface

Mission
-------

Shift the first Organization Studio experience from a static planning page
to a conversation-driven Builder experience.

Repository Truth
----------------

The planning kernel is complete:

- OrganizationManifest
- CapabilityRegistry
- BuilderPlanner
- ExecutionPlan
- BuilderValidation

Decision
--------

The first screen should be the Founder Conversation.

Flow
----

Founder
    │
    ▼
OrganizationConversation
    │
    ▼
OrganizationManifest
    │
    ▼
ExecutionPlan
    │
    ▼
Workspace Preview

Deliverables
------------

client/src/organization/

- OrganizationConversation.tsx
- OrganizationStudio.tsx
- OrganizationRoutes.tsx

Acceptance Criteria
-------------------

The /organization route becomes the public Builder entry point.

The conversation generates (initially from the default demo scenario):

- Organization Manifest
- Execution Plan
- Planned Workspace Preview

No backend calls.
No runtime mutations.
No database writes.

The Builder remains a planner only.