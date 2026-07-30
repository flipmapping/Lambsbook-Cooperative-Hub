# ORG-COM-005

Communication Domain Constitution & Invariants

Authority
---------

COM-ARCH-001
ORG-COM-002A
ORG-COM-003
ORG-COM-004

Mission
-------

Define the constitutional invariants governing the Communication Domain.
These invariants are normative and apply to every communication contract
and every execution stream.

Constitutional Invariants
-------------------------

1. Identity belongs to organizations only.
2. Intents are provider-independent.
3. Policy owns governance decisions.
4. Capability owns feature declarations only.
5. Commercial Capacity owns entitlements only.
6. Delivery adapters own transport only.
7. Aggregates communicate only through exported contracts.

Execution Rule
--------------

Every TypeScript contract materialized under
shared/domain/communication/
shall explicitly conform to these invariants.

Acceptance Criteria
-------------------

The Communication Domain has a single constitutional source of truth
that governs all future contract implementations and prevents
cross-stream divergence.