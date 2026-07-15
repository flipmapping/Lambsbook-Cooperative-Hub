# PIC-001 — Package Is The Contract

Status

APPROVED FOR BUILDER EVOLUTION

Purpose

The certified Package Is the Contract (PIC) is the sole execution
contract consumed by implementation engines.

Builder SHALL package:

- PACKAGE-MANIFEST.md
- IMPLEMENT.md
- Authorities/
- Repository Mutation Corridor
- Standard CLAUDE.md

Builder SHALL:

- remain deterministic
- remain interpretation-free
- package certified authority unchanged

Builder SHALL NOT:

- infer authority
- consume conversational context
- synthesize implementation intent
