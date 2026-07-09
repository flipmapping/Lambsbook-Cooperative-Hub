# Founder Execution Package — Packaging Standard

Status: APPROVED

## Artifact Packaging Verification

Before presenting any exchange artifact to the Founder, Execution SHALL:

1. Generate the archive using Python's standard library `zipfile` module.
2. Reopen the generated archive.
3. Enumerate archive contents.
4. Verify expected repository structure.
5. Record archive size.
6. Record PASS / FAIL certification.

Only verified archives SHALL be presented for Founder download.

TAR exchange artifacts are deprecated for Founder/Claude package exchange.

