# Transitional Communication Boundary

Journey State
      │
      ▼
AdmissionsStageTransitionEvent
      │
      ▼
NotificationTemplateResolver
      │
      ▼
CommunicationIntent
      │
      ├── Resend Adapter
      └── Zalo Adapter

The CommunicationIntent is the canonical business artifact.

Provider adapters execute immutable intents and SHALL remain
provider-specific transport layers only.

The deferred Organization Communication Sovereignty work listed in
COMMUNICATION-ARCHITECTURAL-DEBT.json is intentionally excluded from this sprint.
