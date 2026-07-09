# Governance Manifest

Status: APPROVED

## Purpose

This manifest is the entry point for repository governance.

It identifies the canonical governance domains maintained alongside the Execution Operating System.

## Governance Domains

### Contracts

Location:

- execution/contracts/

Defines the execution contracts and operational profiles.

### Claude Instruction Brief Templates

Location:

- governance/cib/

Defines the canonical Production and Corrective Claude Instruction Brief templates.

### Repository Hygiene

Location:

- governance/repository-hygiene/

Defines repository hygiene decisions, script classification, and cleanup policy.

### Discoveries

Location:

- governance/discoveries/

Records validated technical discoveries that become execution standards.

### Workflows

Location:

- governance/workflows/

Defines canonical Founder execution and packaging workflows.

## Governance Rule

Future governance artifacts SHALL be placed within one of these governance domains.

New governance domains SHALL be explicitly introduced through an approved governance decision.

### Release Governance

Location:

- governance/releases/

Canonical synchronization order:

1. RELEASE-1-STATUS.md
2. RELEASE-1-MANIFEST.md
3. RELEASE-1-BACKLOG.md

These artifacts define the current certified Release state, the certified implementation authorities, and the ordered implementation backlog.

### Execution Derivation

Location:

- governance/execution-derivation/

Purpose:

Contains the canonical execution derivations that translate Founder Decision Records into Infrastructure Authorities, Repository Mutation Packages, and Founder Execution Packages.

Execution SHALL synchronize these derivations after Governance Baseline synchronization and before Repository Truth is established.


governance/execution/RMP-010E34B-BUILDER-VALIDATION-CERTIFICATION.md

governance/execution/FDR-010E34B-PHASE-GATE.md

governance/execution/FDR-010E34B-BUILDER-PHASE-AUTHORIZATION.md

governance/execution-derivation/FDR-010E34B-EXECUTION-DERIVATION.md

governance/cib/generated/CIB-RMP-010E34B-PROSPECT-ADMISSION-DECISION-WORKSPACE.md

governance/rmp/RMP-010E34B-IMPLEMENTATION-AUTHORITY.md

governance/execution/RMP-010E34B-CERTIFIED-LINEAGE.md
