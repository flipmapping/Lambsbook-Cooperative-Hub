# IAS-001

Status

ACTIVE

Effective

Immediately

Purpose

Define the mandatory constitutional structure for all implementation
authorities executed within the Execution Operating System.

Mandatory Sections

Every implementation authority SHALL contain:

1. Authority Identification
2. Repository
3. Mission
4. Repository Truth
5. Implementation Context
6. Repository Mutation Boundary
7. Acceptance Criteria
8. Qualification Evidence
9. Invocation

Invocation

Implementation authorities SHALL invoke Builder only through BIS-001.

Execution Model

Repository Truth
        │
        ▼
Implementation Authority
        │
        ▼
Implementation Context
        │
        ▼
BIS-001
        │
        ▼
Package Is the Contract
        │
        ▼
Claude Repository Mutation
        │
        ▼
Qualification
        │
        ▼
Founder Validation

Constitutional Rules

Implementation authorities SHALL:

• define one bounded repository mutation
• explicitly identify implementation context
• define measurable acceptance criteria
• require repository-backed evidence
• require build and runtime qualification

Implementation authorities SHALL NOT:

• redefine Builder behaviour
• redefine BIS-001
• bypass Package Is the Contract
• combine unrelated implementation authorities

Relationship

BIS-001 defines HOW Builder is consumed.

IAS-001 defines HOW implementation authorities are written.

Builder v1.2 remains certified execution infrastructure.
