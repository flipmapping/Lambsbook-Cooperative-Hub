# Notification Mutation Roadmap

Execution Mode:
    One certified mutation at a time.

Mutation Order

NM-001 → NM-002 → NM-003 → NM-004 → NM-005
                                 ├── NM-006
                                 └── NM-007
                                          │
                                          ▼
                                      NM-008

Rules

- Never skip dependencies.
- Verify runtime evidence after every mutation.
- Do not introduce provider-specific business logic.
- CommunicationIntent remains the canonical business artifact.
- This backlog is the implementation authority until GEX-COM-TRANS-001 closes.
