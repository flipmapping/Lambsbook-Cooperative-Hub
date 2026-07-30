# ORG-DEMO-016

Repository Stewardship Adoption

Authority
---------

ORG-DEMO-015
EOS-CRSG-001
EOS-SYNC-REP-001A

Execution Mode
--------------

Platform Adoption

Mission
-------

Adopt the Repository Stewardship Platform as the governance source for
the Builder Workspace, replacing demo-local governance metadata with
shared platform services.

Repository
----------

client/src/organization/

    governance/
        RepositoryStewardshipAdapter.ts
        AuthorityReference.ts
        TrustChainView.ts
        RelationshipView.ts

    BuilderWorkspace.tsx
    CapabilityCard.tsx
    ExecutionEvidencePanel.tsx

Consumes
---------

shared/platform/repository-stewardship/

(or the canonical platform package when available)

Adoption Objectives
-------------------

Each capability shall consume:

- Authority ID
- Execution Trust Chain
- Repository Synchronization Status
- Relationship Registry
- Compliance Matrix

No governance metadata is maintained locally.

Acceptance Criteria
-------------------

- Governance is consumed through a shared adapter.
- Capability cards display Authority ID and Trust Chain status.
- Builder Workspace no longer duplicates governance metadata.
- Demonstrates Repository Stewardship as platform infrastructure.