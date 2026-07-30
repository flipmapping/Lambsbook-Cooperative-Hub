
# APP-COM-003

Communication Resolution Boundary

Runtime Pipeline

CommunicationIntent
        │
        ▼
CommunicationResolution
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

Resolution Responsibilities

1. Resolve Organization Communication Profile.
2. Resolve Organization Communication Policy.
3. Resolve Template.
4. Resolve Channel Capability.
5. Resolve Provider Capability.

Dispatch Responsibilities

1. Authorize execution only.
2. Never perform business resolution.
3. Produce immutable DispatchDecision.

Certification

This authority separates semantic resolution from execution authorization,
preserving the constitutional boundaries defined by COM-ARCH-001 and
COM-ARCH-002.
