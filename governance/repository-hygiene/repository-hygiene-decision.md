# Repository Hygiene Decision

Status: APPROVED

## Retain

- execution/contracts/
- execution/framework/
- execution/scripts/RMP-*.py

## Archive / Remove

- execution/scripts/apply_WP*.py
  (after archival under a future approved Repository Mutation Package)

## Remove Temporary Packaging Artifacts

- RMP-*-Claude-Package/
- failed *.tar.gz exchange artifacts
- temporary download test archives

## Packaging Standard

Repository Mutation Package exchange artifacts SHALL use Python standard library ZIP packaging.

TAR exchange artifacts are deprecated.

