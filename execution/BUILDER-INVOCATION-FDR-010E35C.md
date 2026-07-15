MISSION

Generate the canonical Claude Package for FDR-010E35C using Builder v1.2.

BUILDER

Certified Builder v1.2

IMPLEMENTATION AUTHORITY

FDR-010E35C
Post-Authentication Runtime Identity Resolution

CONSTITUTIONAL BASELINE

EOS Constitutional Baseline v2.3

BUILDER INPUT

Use the Certified Builder Input Set (CBIS).

Resolve all declared constitutional authorities using the Constitutional Authority Resolver.

Consume the certified implementation artifacts already materialized for FDR-010E35C.

OUTPUT

Produce exactly one Claude Package ZIP.

The package SHALL include:

- PACKAGE-MANIFEST.md
- IMPLEMENT.md
- All resolved constitutional authorities
- Implementation authority
- Execution contract
- Mutation authority
- Validation authority
- Repository baseline
- Repository evidence references
- Required implementation instructions

Do not generate new governance.

Do not generate new authorities.

Do not reinterpret Founder intent.

Package only certified authority.

STOP

Return:

1. Claude Package path
2. PACKAGE-MANIFEST summary
3. IMPLEMENT.md summary
4. Packaged authority list
