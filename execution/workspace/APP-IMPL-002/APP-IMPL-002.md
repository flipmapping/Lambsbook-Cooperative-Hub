
# APP-IMPL-002

RepositoryStewardshipAdapter Implementation

Mission
-------

Implement the production RepositoryStewardshipAdapter using the
published Repository Stewardship Platform contract.

Implementation Deliverables
---------------------------

Create:

client/src/services/repository-stewardship/
    RepositoryStewardshipAdapter.ts
    types.ts

Adapter Responsibilities
------------------------

- verifyPlatform()
- getPlatformState()
- getAuthorityRegistry()
- getRelationshipRegistry()
- getComplianceMatrix()
- getExecutionTrustChain()

Implementation Rules
--------------------

- Consume Repository Stewardship by reference.
- No direct Builder filesystem access.
- No duplicated governance metadata.
- Fail fast on unsupported platform versions.
- Treat the adapter interface—not JSON layout—as the stable contract.

Acceptance Criteria
-------------------

- Builder compiles using RepositoryStewardshipAdapter.
- Governance services are obtained exclusively through the adapter.
- Platform version compatibility is verified before governance is consumed.
- No Builder component depends on Repository Stewardship storage layout.
