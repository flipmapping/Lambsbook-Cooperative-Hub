# DISC-PKG-001 — Python ZIP Packaging Standard

Status: APPROVED

## Observation

Repeated TAR exchange artifacts became zero-byte files within the execution environment.

Python standard library ZIP archives were successfully created, verified, and enumerated.

## Repository Truth

The failure was not caused by:

- Repository Mutation Packages
- execution/framework
- execution/contracts
- repository content

The successful ZIP verification demonstrates that Python's standard library provides a deterministic packaging mechanism.

## Decision

Repository Mutation Package exchange artifacts SHALL use Python's standard library `zipfile` module.

TAR-based exchange artifacts are deprecated for Founder/Claude package exchange.

## Evidence

- Multiple TAR artifacts became zero bytes.
- Python-generated ZIP archive verified successfully.
- Archive contents enumerated successfully.
- Archive checksum generated successfully.

## Impact

Future Founder Execution Packages SHALL package exchange artifacts as verified ZIP archives.

