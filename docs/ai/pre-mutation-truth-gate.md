# PRE-MUTATION TRUTH GATE (MANDATORY)

## RULE
No schema, API, or backend design may proceed without verified system inspection.

## REQUIRED INSPECTION
- Database schema (actual tables)
- Drizzle / ORM schema definitions
- Storage layer implementation
- Identity model (user/member/recipient)
- Related services

## EXECUTION ORDER
INSPECT → EXTRACT TRUTH → VALIDATE → DESIGN → IMPLEMENT

## STOP CONDITIONS
If any of the above is missing → DO NOT PROCEED

## VIOLATIONS
- Designing from assumptions
- Creating duplicate tables
- Ignoring existing structures

## STATUS
LOCKED — ENFORCED ACROSS ALL DEVELOPMENT
