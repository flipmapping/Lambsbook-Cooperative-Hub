# EC-VAL-001
Builder Operational Validation Execution Contract

Execution Operating System: EOS v2.2

Authority Type: Execution Contract

Derived From:

- FEP-VAL-001
- BUILDER-IMPL-001
- BDR-001

Repository Mutation: Not Authorized

contract_provenance:
  execution_contract_id: EC-VAL-001
  source_fep: FEP-VAL-001
  derivation_version: 1.0
  derivation_timestamp: 2026-07-22T09:46:53+00:00


Mission

Execute the Builder Operational Validation defined by the approved Founder
Execution Prompt.

Execution Responsibilities

1. Execute the Builder using the canonical module invocation.
2. Supply the approved Claude Instruction Brief.
3. Capture stdout, stderr, and exit code.
4. Capture generated Builder artifacts.
5. Produce validation evidence.
6. Produce an execution summary.

Execution Constraints

- No Builder source modification.
- No repository mutation.
- No documentation mutation.
- No governance mutation.
- No execution-contract mutation.

Execution Inputs

- Approved Claude Instruction Brief
- Repository root
- Canonical Builder implementation

Execution Outputs

- Builder execution evidence
- Validation summary
- Exit status
- Generated Builder artifacts (if applicable)

Success Criteria

Execution completes successfully using the canonical module invocation.

Exit code is zero.

Validation evidence is produced.

Repository remains unmodified.
