# Mutation Governance

Execution order is defined by:

NOTIFICATION-MUTATION-BACKLOG.json

Each mutation SHALL produce one Mutation Execution Record.

Repository mutation sequence:

Inspect
    ↓
Execute
    ↓
Verify
    ↓
Record Evidence
    ↓
Authorize Next Mutation

No mutation may skip runtime verification.
