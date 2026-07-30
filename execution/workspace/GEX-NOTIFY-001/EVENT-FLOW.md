# Admissions Event Flow

Prospect Stage Update
        │
        ▼
AdmissionsStageTransitionEvent
        │
        ▼
Notification Generator
        │
        ▼
Notification Intent
        │
        ├── Resend Adapter
        ├── Zalo Adapter
        └── Future Channel Adapters

Notification Queue becomes an operational outbox.

Delivery adapters SHALL NOT generate business events.

They SHALL only execute immutable notification intents.
