# BIS-002

Status

ACTIVE

Effective

Immediately

Purpose

Provide the canonical execution template for all future implementation
authorities after Builder v1.2 operational certification.

Execution Pipeline

Repository Truth
        │
        ▼
Implementation Authority
        │
        ▼
Implementation Context
        │
        ▼
Invoke BIS-001
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

Implementation Authority Requirements

Every implementation authority SHALL:

• Establish Repository Truth.
• Define a bounded Implementation Context.
• Invoke Builder exclusively through BIS-001.
• Execute only from the generated Package Is the Contract.
• Return:
  - repository evidence
  - build evidence
  - runtime evidence
  - Founder-visible validation evidence

Implementation authorities SHALL NOT:

• redefine Builder invocation
• modify Builder procedures
• bypass BIS-001
• execute directly from governance artifacts

Recovery

Only a Founder-approved recovery authority may suspend BIS-001.

Constitutional Status

Builder v1.2 is certified execution infrastructure.

Implementation authorities consume Builder through BIS-001 and SHALL treat
Package Is the Contract as the sole execution handoff.
