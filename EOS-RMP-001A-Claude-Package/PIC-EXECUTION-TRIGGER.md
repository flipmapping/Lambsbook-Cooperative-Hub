# Canonical PIC Execution Trigger

Status

MANDATORY

--------------------------------------------------

Implementation Authority

EOS-RMP-001A

--------------------------------------------------

Execution Instruction

The attached Claude Package is the complete implementation contract.

Package Is the Contract (PIC).

Execution SHALL consume this package as the sole authoritative implementation contract.

Execution SHALL synchronize using the governance artifacts contained within this package.

Execution SHALL NOT request additional architectural clarification unless an objectively verified blocker exists.

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Required Deliverables

1.

Updated

execution/builders/build_claude_package.py

2.

Verification Report

3.

Founder Execution Package

--------------------------------------------------

Execution Constraints

Execution SHALL:

- preserve deterministic behaviour;
- preserve namespace independence;
- preserve bounded repository mutation;
- preserve idempotency.

Execution SHALL NOT:

- modify any repository file outside the authorized corridor;
- redesign governance;
- perform Repository Bootstrap.

--------------------------------------------------

Completion Condition

Return only the implementation deliverables required by this package.

Do not expand governance.

Do not redesign architecture.

Implement Builder Sprint 1.
