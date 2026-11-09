# LCH Agent Operating Instructions

**Mandatory first read for all coding agents and repository assistants working in this project.**

1. Read [the approved Working Principles](.agents/memory/WORKING-PRINCIPLES.md) before investigating, planning, or changing project files.
2. Read the active task's control record and relevant prior evidence before repeating inspections or proposing work.
3. Establish current repository, Git, database, and runtime truth separately. Never infer live database state from local migrations or repository history.
4. Respect all task-specific authority boundaries. In particular, no backend, database, schema, migration, endpoint, production, or deployment mutation unless explicitly authorised. Preserve RLS, least privilege, financial controls, and governance invariants.
5. Make one bounded change at a time. Inspect exact target text before editing; preserve unrelated work.
6. Run verification and report section-level outcomes, exit codes, and unresolved limitations. A launched command is not a completed command; a passing test is not release certification.
7. Record exact evidence and end with one optimal next step.

These instructions supplement, and do not override, higher-priority system, platform, security, or explicit user instructions. If this file conflicts with the approved Working Principles or a more specific active task authority, stop and resolve the conflict before mutation.

