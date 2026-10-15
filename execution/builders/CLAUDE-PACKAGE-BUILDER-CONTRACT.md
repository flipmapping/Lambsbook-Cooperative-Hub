# Claude Package Builder Contract

Status

ACTIVE

Purpose

Define the execution contract for the namespace-independent Claude Package Builder.

--------------------------------------------------

Input Contract

Exactly one input artifact SHALL be supplied.

Input

Claude Instruction Brief

--------------------------------------------------

Discovery Rule

The builder SHALL derive every additional artifact from Repository Truth.

The builder SHALL NOT infer naming conventions.

The builder SHALL NOT contain hard-coded authority prefixes.

--------------------------------------------------

Derived Artifacts

From the Claude Instruction Brief, derive:

- Implementation Authority
- Founder Decision
- Execution Derivation
- Repository
- Authority Stream
- Synchronization Set

--------------------------------------------------

Output Contract

The builder SHALL produce:

- Claude Package directory
- ZIP archive
- SHA256 digest
- Package manifest
- PASS / FAIL report

--------------------------------------------------

Compatibility

The builder SHALL support:

- grandfathered authorities
- current authority streams
- future authority streams

without source-code modification.

--------------------------------------------------

Failure Contract

Abort immediately if:

- required artifact missing
- duplicate authority discovered
- authority inconsistency detected
- synchronization artifact missing
- package verification fails

---

## Lifecycle standard alignment (REP-STEWARD-022)

This contract remains the input/output contract for its stated Builder scope. Apply the lifecycle labels, lineage, qualification, and delivery-candidate definitions in `execution/standards/BUILDER-OUTPUT-LIFECYCLE-001.md` to outputs. The contract's one-CIB input rule and other process requirements are not superseded here; input-precedence conflicts with the other active specifications remain unresolved.
