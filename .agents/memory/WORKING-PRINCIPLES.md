# Working Principles — Strategic Automation of Coding for LCH

**Status:** Adopted operating standard  
**Version:** 1.0.0  
**Scope:** All LCH project work performed by ChatGPT, coding agents, Replit workflows, repository stewards, and human collaborators.  
**Authority:** User-approved on 9 November 2026.  
**Safety boundary:** This document governs method; it does not grant authority to mutate production, databases, schemas, Git history, or deployment state.

## 1. Establish truth before acting
- Inspect relevant prior decisions, evidence, repository state, and live-system facts before proposing or making changes.
- Never assume schema, runtime state, permissions, migration status, or release identity.
- Keep repository truth, Git-history truth, database truth, and runtime truth explicitly separate.
- Treat remembered or historical evidence as a lead, not proof of current live state.

## 2. Reuse evidence; avoid repetitive investigation
- Search existing records and completed inspections before repeating work.
- Repeat an inspection only when new evidence, changed state, or a material uncertainty could change the decision.
- Maintain one concise control record for each active restoration or remediation stream.

## 3. Convert findings into bounded progress
- Classify each finding as confirmed defect, risk, dependency, blocker, or unverified hypothesis.
- Prefer the smallest safe corrective action that resolves a confirmed defect.
- Do not prolong investigation after a decisive blocker is established; record the blocker and move to the next independent, authorised task.
- Maintain one optimal next step. Avoid speculative parallel work and unnecessary choices.

## 4. Preserve security and governance integrity
- Never bypass or weaken Row-Level Security (RLS), authorization, auditability, financial controls, immutable-ledger rules, or governance boundaries.
- Never introduce service-role access into frontend code.
- Respect RPC-only mutation boundaries and existing least-privilege design.
- Do not create new endpoints or mutate backend/database/schema while the project is under a backend pause.
- A request to improve workflow does not itself authorize production changes.

## 5. Enforce pre-mutation gates
Before every mutation:
1. Confirm the exact target, current state, and relevant authority.
2. Inspect the exact text or object to be changed (Textual Certainty Gate).
3. Confirm the change is within the authorised scope (Pre-Mutation Truth Gate).
4. Preserve unrelated work and evidence.
5. Make one bounded mutation at a time.

No staging, commit, push, merge, reset, clean, deployment, migration, or production change without explicit authorization. Use the Replit Git UI for Git operations unless the user explicitly authorizes another route.

## 6. Execute with observable completion
- Use the persistent workspace execution runner for repository commands when available.
- Record run ID, command, working directory, starting HEAD, final HEAD, and output locations.
- Distinguish launched, running, completed, failed, and cancelled states. A launched process is not a successful process.
- Require explicit terminal state and exit code; inspect stdout and stderr.
- Report failures at the smallest section level. Never allow a masked subsection failure to be represented as a globally successful audit.

## 7. Verify immediately after each correction
- Run the narrowest relevant test first, then the necessary build, regression, security, or governance checks.
- Verify the actual changed behavior, not merely command completion.
- Do not claim a fix based only on source edits or a passing unrelated test.
- If verification is blocked, state precisely what remains unverified.

## 8. Close the evidence loop
For each completed work unit, record:
- exact scope and target;
- baseline and resulting repository identity;
- files/objects changed and hashes where material;
- commands, run IDs, exit codes, and test outcomes;
- security/governance implications;
- unresolved dependencies, restrictions, and certification status.

Keep restoration, remediation, verification, and release certification as distinct states. Never imply certification from a successful restoration or test run alone.

## 9. Communicate for decisive progress
- Give concise architectural reasoning, normally within 6–10 lines.
- State what is known, what is not known, and why it matters.
- Give one recommended next step, not a menu of competing paths.
- For technical execution, provide one exact, copy-pasteable command block when a command is needed.
- Do not ask the user to repeat evidence already available. Recover it from the repository, execution record, or relevant connected source where possible.
- Be candid about tool limitations; never claim an action or verification succeeded without its result.

## 10. Continuous improvement
- Consolidate repeated checks into reusable scripts or checklists when safe and justified.
- Improve audit tooling so every required section has an explicit PASS/FAIL/NOT-RUN result.
- Prefer durable, versioned project guidance over reliance on conversational recollection alone.
- When a new decision supersedes this standard, update the versioned record and preserve its decision history.

## Current LCH constraints
These constraints remain controlling unless the user explicitly changes them:
- Backend/database/schema mutation is paused until SQL access is restored and a specific change is authorised.
- Frontend work may proceed within existing scope.
- No RLS bypass, no service-role usage in frontend, no new endpoints.
- Preserve unrelated dirty files; do not use broad replacements for narrow fixes.
- One mutation at a time.
- The current MemberHub acceptance RPC definition is not established by local repository evidence. A missing local definition does not prove absence from the remote database. Do not implement or replace it without authorised live-database evidence.

## Adoption rule for agents
At the start of every LCH task, read this document and the active task/control record. Apply the gates relevant to the requested work. If a higher-priority security, platform, or user instruction conflicts, follow the higher-priority instruction and record the conflict where appropriate.
