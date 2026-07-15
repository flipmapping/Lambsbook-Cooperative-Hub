# BUILDER IMPLEMENTATION ENGINE

STATUS

EXECUTE NOW

IMPLEMENTATION MODE

Strategic Execution Mode

PACKAGE IS THE CONTRACT

Consume only the following implementation package:

- execution/implementation-authorities/BLD-PIC-001-PIC-Materialization-Service.json
- execution/implementation-authorities/BLD-PIC-001-IMPLEMENT.md
- execution/implementation-work-packages/BLD-PIC-001-WP001-PIC-Materialization.json
- execution/implementation-work-packages/BLD-PIC-001-WP001-EXECUTE.md

MISSION

Implement the Builder PIC Materialization Service.

DO NOT create additional governance artifacts.

DO NOT create additional implementation authorities.

DO NOT create additional work packages.

DO NOT redesign Builder architecture.

OBJECTIVE

Modify Builder implementation so that it can publish a certified
Package Is the Contract (PIC) that conforms to
BUILDER-CONSTITUTIONAL-BASELINE-v1.2.1.

REQUIRED CAPABILITIES

Builder SHALL:

1. Resolve the Certified Builder Input Set (CBIS).
2. Resolve declared constitutional authorities.
3. Preserve authority lineage.
4. Collect authorized repository mutation surfaces.
5. Generate:
   • PACKAGE-MANIFEST.md
   • IMPLEMENT.md
   • CLAUDE.md
   • package.json
6. Materialize:
   • authorities/
   • repository/
   • evidence/
7. Execute the PIC Qualification Gate.
8. Publish exactly one PIC ZIP.

RETURN ONLY

1. Files modified.
2. Unified diff summary.
3. Commands executed.
4. Build evidence.
5. Qualification evidence.
6. PIC ZIP location.
7. Remaining implementation gap (if any).

STOP CONDITION

Stop immediately after the first compliant PIC ZIP has been produced.

No further governance artifacts are authorized.
