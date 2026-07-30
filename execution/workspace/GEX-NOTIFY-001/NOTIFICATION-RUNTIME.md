# Canonical Runtime

AdmissionsStageTransitionEvent
        │
        ▼
NotificationTemplateResolver
        │
        ▼
CommunicationIntent
        │
        ▼
NotificationIntentStore
        │
        ▼
NotificationDeliveryProjection
        │
        ├── Resend Adapter
        └── Zalo Adapter

Adapters SHALL consume persisted NotificationIntent records only.

No adapter is permitted to construct business payloads.

All retries originate from NotificationIntentStore.

Communication Sovereignty (COM-ARCH-001) will reuse this persistence
model unchanged.
