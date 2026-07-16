# BLD-PIC-001 IMPLEMENTATION DISPATCH

STATUS

EXECUTE NOW

EXECUTION MODE

Strategic Execution Mode

IMPLEMENTATION ENGINE

Builder v1.2

AUTHORITATIVE INPUTS

- execution/constitutional-baseline/BUILDER-CONSTITUTIONAL-BASELINE-v1.2.1.json
- execution/implementation-authorities/BLD-PIC-001-PIC-Materialization-Service.json
- execution/implementation-authorities/BLD-PIC-001-IMPLEMENT.md
- execution/implementation-work-packages/BLD-PIC-001-WP001-PIC-Materialization.json
- execution/implementation-work-packages/BLD-PIC-001-WP001-EXECUTE.md
- execution/implementation-tasks/BLD-PIC-001-BUILDER-RUNTIME-MUTATION.md

MISSION

Mutate the existing Builder source code.

This dispatch is the final governance artifact for BLD-PIC-001.

Implement the Builder runtime that generates the first certified
Package Is the Contract (PIC).

DO NOT

- create additional governance artifacts
- create additional implementation authorities
- create additional work packages
- create additional implementation tasks
- recreate package contracts
- rediscover Repository Truth

IMPLEMENT

Builder shall:

1. Consume the Certified Builder Input Set (CBIS).
2. Resolve declared constitutional authorities.
3. Collect authorized repository mutation surfaces.
4. Generate:
   - PACKAGE-MANIFEST.md
   - IMPLEMENT.md
   - Standard CLAUDE.md
   - package.json
5. Materialize:
   - authorities/
   - repository/
   - evidence/
6. Execute the PIC Qualification Gate.
7. Publish exactly one certified PIC ZIP.

RETURN ONLY

1. Repository mutation summary.
2. Files modified.
3. Unified diff summary.
4. Commands executed.
5. Build evidence.
6. Qualification evidence.
7. Generated PIC ZIP location.

STOP CONDITION

Stop after the first certified PIC ZIP has been generated.
