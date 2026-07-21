# BUILDER IMPLEMENTATION WORKLIST

Status: READY FOR IMPLEMENTATION

## Mutation Tasks

- [ ] M001 — **MANDATORY_FIELDS**: Remove 'Execution Derivation' from required Builder input contract.
- [ ] M002 — **locate_artifacts**: Remove repository discovery of Execution Derivation as an external artifact.
- [ ] M003 — **verify_artifact_existence**: Exclude Execution Derivation from required repository-governed artifact validation.
- [ ] M004 — **main**: Insert deterministic Execution Derivation generation immediately after governance validation succeeds.
- [ ] M005 — **generated_execution_derivation**: Validate generated Execution Derivation before packaging.
- [ ] M006 — **_assemble_artifacts**: Package Builder-generated Execution Derivation instead of copying one from the repository.

## Acceptance Criteria

- [ ] Execution Derivation is no longer a required repository input.
- [ ] Builder generates Execution Derivation deterministically from validated governance artifacts.
- [ ] Generated Execution Derivation is validated before packaging.
- [ ] Generated Execution Derivation is certified as Builder-produced.
- [ ] Builder package contains the generated Execution Derivation.
- [ ] Builder invocation succeeds without requiring an externally authored Execution Derivation.

## Protected Principles

- No manual Execution Derivation.
- No additional implementation intent introduced.
- Governance hierarchy preserved (FAB -> IA -> CIB -> ICM).
- Builder validation and certification remain intact.

## Implementation Notes

- Perform as a single atomic repository mutation.
- Do not modify application repositories.
- Do not weaken Builder validation or certification.
- Validate against this checklist immediately after implementation.