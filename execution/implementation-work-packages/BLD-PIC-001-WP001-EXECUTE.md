# BLD-PIC-001-WP001 EXECUTION

STATUS

EXECUTE NOW

IMPLEMENTATION MODE

Strategic Execution Mode

INPUT AUTHORITIES

- BUILDER-CONSTITUTIONAL-BASELINE-v1.2.1
- BLD-CAR-001
- EOS-EXEC-017
- EXEC-SYNC-005
- EXEC-SYNC-006
- EXEC-SYNC-007
- BLD-PIC-001
- BLD-PIC-001-WP001

MISSION

Implement the Builder PIC Materialization Service.

OBJECTIVE

Builder shall generate a certified Package Is the Contract (PIC) by:

1. Resolving the Certified Builder Input Set (CBIS).
2. Resolving declared constitutional authorities.
3. Collecting authorized repository mutation surfaces.
4. Materializing:
   - PACKAGE-MANIFEST.md
   - IMPLEMENT.md
   - CLAUDE.md
   - package.json
   - authorities/
   - repository/
   - evidence/
5. Executing the PIC Qualification Gate.
6. Publishing exactly one PIC ZIP.

EXECUTION RULES

- Synchronize with Repository Truth before mutation.
- Mutate only Builder implementation code.
- Preserve Builder public interfaces unless required by the authority.
- Preserve constitutional compatibility with BUILDER-CONSTITUTIONAL-BASELINE-v1.2.1.

RETURN ONLY

1. Files modified.
2. Unified diff summary.
3. Build evidence.
4. Qualification evidence.
5. Generated PIC ZIP location.
6. Remaining implementation gap (if any).

STOP CONDITION

After publishing the first compliant PIC ZIP, stop.
Do not generate additional governance artifacts.
