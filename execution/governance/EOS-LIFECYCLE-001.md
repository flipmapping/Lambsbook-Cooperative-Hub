# EOS-LIFECYCLE-001

Execution State Machine

Purpose
-------

Standardize the lifecycle reported by every execution stream.

Canonical States
----------------

PLANNING

AUTHORIZED

GOVERNANCE_COMPLETE

EXECUTION_IN_PROGRESS

EXECUTION_COMPLETE

DEPLOYMENT_VERIFIED

RUNTIME_VERIFIED

OPERATIONALLY_CERTIFIED

Rules
-----

1. Every execution authority shall declare its current state.
2. State transitions require objective evidence.
3. Governance artifacts stop once GOVERNANCE_COMPLETE is reached.
4. The next expected artifacts after GOVERNANCE_COMPLETE are execution evidence.
5. OPERATIONALLY_CERTIFIED is only permitted after deployment and runtime verification succeed.