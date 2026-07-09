# Claude Instruction Brief

Implementation Authority

EOS-RMP-CERS-001

Status

ACTIVE

Repository

Open Brain

Repository Bootstrap

PASS

Production Surface

Canonical Execution Registry Services (CERS)

Repository Truth

Certified

Purpose

Implement the Canonical Execution Registry Services (CERS) by consuming the
existing Builder v1.0, package infrastructure, and governance registry.

Repository Mutation Corridor

MODIFY

- execution/builders/
- execution/packages/
- governance/registry/

DO NOT MODIFY

- server/
- client/
- web/

Execution SHALL

- consume certified Repository Truth;
- preserve namespace independence;
- preserve deterministic package generation;
- preserve Builder v1.0 contracts;
- perform bounded repository mutation only.

Required Deliverable

Standalone executable Python Repository Mutation Package.

Response Restriction

No partial implementation.

Stop

Generate only the Python Repository Mutation Package and the corresponding
Founder Execution Package.
