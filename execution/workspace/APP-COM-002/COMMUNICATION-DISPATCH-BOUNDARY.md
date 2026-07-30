
# APP-COM-002

Communication Dispatch Boundary

Runtime Pipeline

CommunicationIntent
        │
        ▼
CommunicationRecord
        │
        ▼
DispatchDecision
        │
        ▼
Queue
        │
        ▼
ProviderAdapter
        │
        ▼
DeliveryAttempt

Constitutional Rules

1. Queue never determines business policy.

2. DispatchDecision authorizes execution.

3. Queue executes only authorized work.

4. ProviderAdapter performs transport only.

5. DeliveryAttempt remains append-only.

6. Audit is reconstructed from DispatchDecision
   and DeliveryAttempt history.

Certification

This boundary separates execution authorization
from transport orchestration and preserves the
constitutional ownership defined by COM-ARCH-001.
