# APP-MEMBER-DASH-001 Cycle 2 — Reusable Execution Lessons

## Builder

The existing Builder was proven executable from repository root.

Path:

execution/builders/build_claude_package.py

Observed CLI contract:

- positional CIB argument is required;
- --repo-root is optional;
- --output-dir is optional;
- main() uses argparse;
- Python module import succeeds from repository root.

## Package Generation

The Builder generates current root contracts from current authoritative
inputs.

An old materialized package must not be treated as Builder authority.

## ICM

ICM correlation with a production surface does not establish task authority.

Task-specific authority must be explicit or Founder-designated.

## Historical Artifacts

A stale ICM dependency can sometimes be recovered from exact Git history.

Recovery requires:

1. exact path/object identification;
2. exact content/object verification;
3. explicit authorization;
4. controlled restoration.

The existence of a Git object alone is not authorization.

## Package Equivalence

Fresh package generation may change timestamps or ZIP metadata.

Therefore independent ZIP byte equality is not a suitable default
equivalence test.

Use contract and inventory equivalence plus release ZIP self-integrity.

## Observability

A blank terminal/UI result does not prove that Builder execution failed.

Durable stdout/stderr capture plus exit code distinguishes:

OBSERVABILITY FAILURE
from
BUILDER EXECUTION FAILURE.

## Inspection Efficiency

Repeated searches occurred because facts were proven at multiple layers.

Future execution should resolve each invariant once and carry the result
forward.

## Temporary Artifacts

Repository-local inspection artifacts create additional release-surface
inspection and cleanup work.

Prefer /tmp for temporary Builder/package experiments.

## Process Boundary

Cross-stream execution infrastructure should be institutionalized by
Strategic Architecture / Governance.

Application streams should consume the resulting capability rather than
reconstructing the execution doctrine independently.
