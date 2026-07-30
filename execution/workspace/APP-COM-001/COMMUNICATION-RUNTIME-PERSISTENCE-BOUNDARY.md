
# APP-COM-001

Communication Runtime Persistence Boundary

Runtime Ownership

CommunicationIntent
        │
        ▼
CommunicationRecord
        │
        ├──────────────┐
        ▼              ▼
ResendAdapter     ZaloAdapter
        │              │
        ▼              ▼
DeliveryAttempt   DeliveryAttempt
        │
        ▼
Audit

Constitutional Rules

1. CommunicationIntent is immutable.

2. CommunicationRecord owns runtime state.

3. DeliveryAttempt is append-only.

4. Provider adapters never mutate CommunicationIntent.

5. Queue operates on CommunicationRecord only.

6. Audit is reconstructed from DeliveryAttempt history.

Certification

This boundary satisfies COM-ARCH-001 by separating
business semantics from runtime execution while preserving
provider independence.
