const fs = require('fs');

const srcPath = 'docs/ai/system-control-plane.md';
const outPath = 'docs/ai/automation-execution-registry.md';

const src = fs.readFileSync(srcPath, 'utf8');

function requireText(label, patterns) {
  const hit = patterns.some((p) => p.test(src));
  if (!hit) {
    console.error(`MISSING REQUIRED CONCEPT: ${label}`);
    process.exit(1);
  }
}

requireText('Strategic role', [/Strategic Chat/i, /Strategic Authority/i]);
requireText('Main Hub authority', [/Main Hub/i, /Hub authority/i]);
requireText('Onboarding Gateway', [/Onboarding Gateway/i, /Gateway/i]);
requireText('Open Brain', [/Open Brain/i]);
requireText('runtime contract', [/runtime contract/i]);
requireText('inspection-first workflow', [/truth retrieval/i, /inspect/i, /define packet/i, /execute/i, /verify/i]);

const content = `# Automation Execution Registry

## Purpose

This document operationalizes \`docs/ai/system-control-plane.md\` into an automation-safe execution registry for Lambsbook Cooperative Hub (LCH). It does not create new doctrine. It converts the system control plane into executable automation constraints, allowed lanes, and verification requirements.

## Authority Mapping Table

| Plane / Function | Canonical Authority | Automation Permission |
|---|---|---|
| Doctrine, role boundaries, laws | Strategic Authority | Inspect, extract, codify; no unauthorized reinterpretation |
| Backend truth, runtime contract, domain semantics | Main Hub Authority | Inspect and mutate only within canonical contract |
| Tier-2 entry / UX / dependent surface | Onboarding Gateway Authority under Main Hub | Mutate only when contract already defined by Main Hub |
| Memory synchronization | Open Brain | Capture verified truths only; never invent truth |

## Surface Classification Table

| Surface | Classification | Automation Mode |
|---|---|---|
| docs/ai/system-control-plane.md | Supreme source-of-truth document | Read-only authority source |
| Main Hub backend/runtime surfaces | Canonical truth surface | Inspect-first, bounded mutation allowed |
| Onboarding Gateway frontend surfaces | Dependent surface | Contract-following mutation only |
| Open Brain memory layer | Synchronization layer | Verified capture only |

## Allowed Automation Lanes

1. Inspect canonical truth from control-plane and live system.
2. Derive bounded execution instructions from verified truth.
3. Mutate only one surface at a time under the proper authority boundary.
4. Verify immediately after each mutation.
5. Capture reusable verified truths into Open Brain after proof.

## Forbidden Automation Behaviors

- Inferring architecture without inspection
- Mutating Gateway to define backend truth
- Creating alternate runtime contracts
- Skipping verification
- Capturing unverified assumptions into Open Brain
- Cross-surface redesign without Strategic authorization
- Reconstructing identity or weakening canonical request doctrine
- Introducing dual meaning for invitation, membership, or relationship flows

## Pre-Mutation Truth Gate

No mutation is allowed unless all of the following are true:

1. Relevant truth is retrieved from \`docs/ai/system-control-plane.md\` and/or Open Brain.
2. Live system inspection confirms the current state.
3. A concrete mismatch, gap, or required implementation target is explicitly proven.
4. The target surface is authorized for mutation under the authority model.
5. The mutation is bounded and immediately verifiable.

## Execution Protocol by Surface

### Strategic / Doctrine layer
- Extract
- Normalize
- Codify
- Do not mutate runtime behavior directly

### Main Hub
- Inspect exact live files / routes / contracts
- Mutate only bounded proven targets
- Verify build / typecheck / route behavior immediately

### Onboarding Gateway
- Must consume Main Hub contract
- Must not invent backend semantics
- UI/state/API behavior must mirror canonical contract exactly

### Open Brain
- Capture only stable, reusable, verified truths
- Record authority owner, date, and scope of truth

## Verification Protocol

Every automated coding action must be followed by visible proof:
- exact file existence / target confirmation
- exact grep / diff / excerpt proof
- typecheck/build/runtime verification as appropriate
- fail-closed if anchor or expected contract is missing

## Open Brain Capture Rules

Capture into Open Brain only when:
- truth is stable
- truth has been confirmed by live inspection and/or successful execution
- the captured item has future reuse value
- the authority owner is clear

Do not capture:
- guesses
- draft designs
- unverified inferred behavior
- temporary troubleshooting hypotheses

## Escalation Conditions

Escalate to Strategic Authority when:
- multiple truths appear to conflict
- Gateway needs behavior not yet defined by Main Hub
- runtime contract simplification is proposed
- a mutation would cross authority boundaries
- performance work risks changing meaning or truth ownership

## Definition of Done for Automated Coding

Automated coding is complete only when:
1. The target change is authorized.
2. The mutation is bounded.
3. Verification is visible and successful.
4. No contract drift is introduced.
5. Reusable truths are captured into Open Brain when appropriate.

## Appendix: Canonical Command Patterns

- Inspect first
- Mutate second
- Verify immediately
- Capture verified reusable truth afterward
`;

fs.writeFileSync(outPath, content);
console.log(`WROTE ${outPath}`);
