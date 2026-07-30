# ORG-COM-004

Communication Domain Aggregate Materialization

Authority
---------

COM-ARCH-001
ORG-COM-002A
ORG-COM-003

Mission
-------

Refine the Communication Domain into four constitutional aggregates to
support long-term scalability and clear ownership boundaries.

Canonical Repository
--------------------

shared/domain/communication/

identity/
    organization-communication-profile.ts

governance/
    communication-intent.ts
    communication-policy.ts
    template-governance.ts
    communication-readiness.ts

capability/
    channel-capability-registry.ts
    commercial-capacity.ts

delivery/
    provider-adapter-contract.ts

index.ts

Aggregate Responsibilities
--------------------------

Identity
    Organization communication identity.

Governance
    Communication rules, policy, templates, readiness.

Capability
    Platform channel capabilities and commercial entitlements.

Delivery
    Provider transport abstraction only.

Constitutional Rules
--------------------

- One contract belongs to one aggregate.
- Aggregates communicate only through exported types.
- No provider-specific logic outside the delivery aggregate.
- Identity and Governance are authored by Organization Studio.
- Communication Intent originates from Growth Engine.
- Runtime orchestration belongs to the Main App.

Acceptance Criteria
-------------------

The Communication Domain is organized by aggregate boundaries rather than
individual files, providing a stable constitutional foundation for all
future communication capabilities.