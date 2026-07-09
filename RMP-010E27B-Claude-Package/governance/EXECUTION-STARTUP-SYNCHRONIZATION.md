# Execution Startup Synchronization

Status: APPROVED

## Purpose

This document is the canonical synchronization artifact consumed during Execution Startup.

It summarizes approved Repository Truth that SHALL be assumed by new execution and strategic sessions.

Execution SHALL synchronize this document before generating Repository Mutation Packages or Claude Instruction Briefs.

---

## Current Synchronization Baseline

### Governance

- governance/GOVERNANCE-MANIFEST.md
- governance/README.md

### Claude Instruction Brief Templates

- governance/cib/CIB-PROD-v1.0.md
- governance/cib/CIB-CORR-v1.0.md

### Repository Hygiene

- governance/repository-hygiene/execution-script-classification.md
- governance/repository-hygiene/repository-hygiene-decision.md

### Discoveries

- governance/discoveries/DISC-PKG-001-python-zip-packaging-standard.md

### Founder Packaging Workflow

- governance/workflows/founder-execution-package-packaging-standard.md

### Execution Contracts

- execution/contracts/EXECUTION-CAPABILITY-CONTRACT.md
- execution/contracts/EXECUTION-STARTUP-PROTOCOL.md
- execution/contracts/EXECUTION-OPERATIONAL-PROFILES.md

---

## Current Repository Truth

Execution SHALL assume:

- Canonical CIB templates exist within governance/cib/.
- Repository Mutation Packages are the canonical implementation artifact.
- Founder Execution Packages are mandatory for materialization.
- Python standard library ZIP packaging is the canonical exchange mechanism.
- Exchange artifacts SHALL be verified before presentation.
- Failed exchange artifacts SHALL be removed.
- Repository hygiene is part of the canonical repository baseline.

---

## Synchronization Rule

Future approved governance decisions SHALL append a synchronization entry to this document.

Execution Startup SHALL consume this document before artifact generation.

