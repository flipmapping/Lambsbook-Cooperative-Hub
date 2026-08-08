# EOS-SYNC-REPO-HYGIENE-001

## Status

CERTIFIED — 2026-08-08

## Repository Hygiene

Transient purge roots are certified empty:

- .recovery
- downloads
- download
- .tmp_founder_sample

The repository now has a trustworthy transient-artifact boundary.

## Preserved Artifact

execution/certification/GE-IMPORT-006/ctbc-import-test.xlsx

This artifact is intentionally preserved for GE import validation.

## Execution Rules

1. Do not recreate the certified purge roots.
2. Do not use execution/ as unrestricted scratch space.
3. Do not use `git add .`.
4. Do not perform broad reset, checkout, clean, or deletion operations.
5. Commits must contain only authority-scoped, explicitly reviewed files.
6. The canonical build command is `npm run build`, which executes `node scripts/build-server.mjs`.
7. The build includes frontend Vite compilation and backend esbuild bundling.
8. Do not treat repository-wide TypeScript compilation as a generic health gate.
9. Prefer bounded Execution Surface Manifest validation for execution authorities.
10. Runtime/build failures must be classified before mutation.

## Stream Transition

ACTIVE execution streams may resume implementation.

Build validation is permitted using the canonical build command.

GitHub commit is permitted only after:

- authority-scoped file review,
- canonical build/runtime evidence where applicable,
- no unrelated files staged,
- explicit commit scope verification.

## Doctrine

Repository hygiene is now a baseline, not an invitation for further broad cleanup.

Next priority: build-surface isolation and controlled execution.

7. The build includes frontend Vite compilation and backend esbuild bundling.
8. Do not treat repository-wide TypeScript compilation as a generic health gate.
9. Prefer bounded Execution Surface Manifest validation for execution authorities.
10. Runtime/build failures must be classified before mutation.

## Stream Transition

ACTIVE execution streams may resume implementation.

Build validation is permitted using the canonical build command.

GitHub commit is permitted only after:

- authority-scoped file review,
- canonical build/runtime evidence where applicable,
- no unrelated files staged,
- explicit commit scope verification.

## Doctrine

Repository hygiene is now a baseline, not an invitation for further broad cleanup.

Next priority: build-surface isolation and controlled execution.
