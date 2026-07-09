# Execution Startup Synchronization

Status: APPROVED

## Purpose

This document is the canonical synchronization artifact consumed during Execution Startup.

It summarizes approved Repository Truth that SHALL be assumed by new execution and strategic sessions.

Execution SHALL synchronize this document before generating Repository Mutation Packages or Claude Instruction Briefs.

---



## Canonical Startup Synchronization

Execution SHALL synchronize:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md

before consuming any individual governance artifacts.

The Synchronization Index is the authoritative startup entry point.

Execution SHALL follow the synchronization order defined by the index.

Execution SHALL NOT bypass or reorder the synchronization sequence unless explicitly authorized by a Governance Authority.


## Current Synchronization Baseline

The canonical synchronization sequence is defined exclusively by:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md

This document SHALL summarize startup objectives only.

Execution SHALL obtain synchronization order from the Synchronization Index.


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

