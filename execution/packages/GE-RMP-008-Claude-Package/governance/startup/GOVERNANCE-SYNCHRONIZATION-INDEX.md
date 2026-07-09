# Governance Synchronization Index

Status: APPROVED

## Purpose

This document defines the canonical synchronization order for all execution and strategic sessions.

Execution SHALL synchronize the following artifacts in order before establishing Repository Truth.

## Synchronization Order

1. governance/GOVERNANCE-MANIFEST.md

2. governance/BASELINE.md

3. governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md

4. governance/releases/RELEASE-1-STATUS.md

5. governance/releases/RELEASE-1-MANIFEST.md

6. governance/releases/RELEASE-1-BACKLOG.md

7. governance/execution/EXECUTION-PIPELINE.md

8. execution/contracts/

9. governance/cib/CIB-PROD-v1.0.md
   or
   governance/cib/CIB-CORR-v1.0.md

## Rule

Repository Truth SHALL NOT be established until this synchronization sequence has completed.

Repository Mutation Packages SHALL consume this synchronization baseline before repository inspection begins.


CLAUDE-NAMESPACE-SYNCHRONIZATION.md

Purpose

Synchronizes execution packages with the stream-prefixed authority namespace while preserving all grandfathered authorities.

Mandatory

YES

AUTHORITY-NAMESPACE-RULE-v1.0.md

Purpose

Canonical repository-backed authority namespace specification.

Mandatory

YES
