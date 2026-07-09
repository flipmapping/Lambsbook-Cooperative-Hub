# Claude Package Builder Specification

Status

ACTIVE

Purpose

Generate a complete Claude Execution Package from Repository Truth.

--------------------------------------------------

Input

Mandatory

- Implementation Authority
- Claude Instruction Brief

Derived

- Founder Decision
- Execution Derivation
- Repository
- Authority Stream

--------------------------------------------------

Authority Rule

The builder SHALL NOT infer or hard-code authority prefixes.

The builder SHALL derive the implementation authority directly from the CIB.

Examples

GE-RMP-002
HUB-RMP-014
EOS-RMP-001
RMP-010E34B

All are valid.

--------------------------------------------------

Synchronization Set

Always include:

- governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md
- governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md
- governance/startup/AUTHORITY-NAMESPACE-RULE-v1.0.md
- governance/startup/CLAUDE-NAMESPACE-SYNCHRONIZATION.md
- governance/BASELINE.md
- governance/execution/EXECUTION-PIPELINE.md

Include the work-package specific artifacts:

- Founder Decision
- Execution Derivation
- Implementation Authority
- Infrastructure Certification (if applicable)
- RMP Certification prerequisites (if applicable)
- Generated CIB

--------------------------------------------------

Package Outputs

The builder SHALL generate:

Package Directory

Package ZIP

SHA256

Manifest

PASS / FAIL Report

--------------------------------------------------

Quality Gates

Verify:

- every referenced artifact exists
- no missing prerequisite
- zip created
- SHA256 generated
- package manifest complete

Abort on first failure.

--------------------------------------------------

Compatibility

Supports:

Legacy authorities

- RMP-010Exx

Current authorities

- GE-RMP
- HUB-RMP
- EOS-RMP
- INF

Future authority streams without modification.
