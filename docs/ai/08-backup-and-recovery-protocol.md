# BACKUP AND RECOVERY PROTOCOL — LAMBSBOOK

## PURPOSE
This document defines the mandatory backup, rollback, recovery, and checkpoint rules for all code and document mutations in the Lambsbook project.

---

## CORE PRINCIPLE
No mutation is allowed unless it is recoverable.

Every change must be protected at the appropriate level before mutation begins.

---

## RECOVERY LEVELS

### Level 1 — File backup
Used for:
- single-file mutations
- bounded local edits
- exact-match patches
- document mutations

Requirement:
- create a timestamped backup of every target file immediately before mutation
- backup must occur inside the same mutation run before the write step

Pattern:
`original.ext.bak_YYYYMMDD_HHMMSS`

Example:
`page.tsx.bak_20260408_054500`

Purpose:
- fastest immediate rollback
- protection against partial or corrupt mutation

---

### Level 2 — Packet backup and log
Used for:
- any bounded work packet
- any AI-assisted execution packet
- any multi-file mutation session

Requirement:
- start visible logging with tee
- list the files being touched
- create file backups for each touched file before mutation
- preserve the packet log path

Purpose:
- auditability
- rollback map
- verification of what ran

---

### Level 3 — Session snapshot
Used for:
- cross-layer work
- risky auth changes
- runtime contract changes
- invitation flow changes
- dashboard/shared-surface changes
- larger coordinated work sessions

Requirement:
- create a broader snapshot before mutation
- preferred methods:
  1. Git branch/checkpoint when appropriate
  2. archive snapshot when needed

Example archive scope:
- web/
- server/
- docs/ai/
- relevant SQL or migration files

Purpose:
- recover from broader multi-file or multi-layer failure

---

### Level 4 — Milestone checkpoint
Used for:
- accepted logical completion points
- verified good states
- approved implementation units
- approved specification revisions

Requirement:
- after verification and approval, create a GitHub checkpoint commit
- use clear checkpoint wording
- checkpoint only accepted states, never unreviewed AI output

Purpose:
- durable restore point
- repository-level audit trail
- recovery from later regressions

---

## MANDATORY BACKUP CADENCE

### Before every single file mutation
Required every time:
1. identify exact file
2. create timestamped backup beside the file
3. then mutate

No exceptions.

---

### Before every bounded packet
Required every time:
1. start packet log with tee
2. identify all target files
3. create backups for each target file
4. then perform mutation

---

### Before every cross-layer work session
Required whenever the change touches more than one major layer, including combinations of:
- web
- server
- docs/ai
- SQL or schema artifacts
- runtime contracts
- auth/invitation/shared dashboard surfaces

Create:
- packet log
- file backups
- session snapshot if risk is medium or high

---

### After every accepted milestone
Required when a logical unit is:
- verified
- reviewed
- approved

Then:
- update canonical documentation if needed
- capture reusable truth to Open Brain if needed
- create a GitHub checkpoint commit

---

## BACKUP METHODS

### Method A — File backup
Example pattern:
cp "path/to/file.tsx" "path/to/file.tsx.bak_$(date +%Y%m%d_%H%M%S)"

Use for:
- exact-match local changes
- single-file edits
- docs/ai changes

---

### Method B — Packet logging
Example pattern:
LOG="/tmp/packet_name_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG") 2>&1

Use for:
- all meaningful mutation sessions

---

### Method C — Session archive
Example pattern:
tar -czf "/tmp/lambsbook_session_$(date +%Y%m%d_%H%M%S).tar.gz" web server docs/ai

Use for:
- broader work that may require higher-scope restore

---

### Method D — GitHub checkpoint
Use for:
- accepted, verified, approved states only

Commit message style:
- checkpoint: [clear logical accomplishment]

Examples:
- checkpoint: truth synchronization protocol established
- checkpoint: canonical dashboard invitation discovery aligned

---

## ROLLBACK RULES

### Immediate rollback
If a mutation fails visibly and the rollback target is clear:
- restore the affected file from the newest correct `.bak_...` copy

---

### Inspect-before-rerun rule
If a shell run gives:
- no output
- ambiguous output
- partial output
- interrupted output

Then:
1. inspect the target file first
2. inspect whether partial mutation already happened
3. do not rerun blindly

Purpose:
- prevent duplicate or compounding corruption

---

### Packet rollback
If a packet changes multiple files incorrectly:
1. inspect each changed file
2. restore only affected files from backups
3. review log output
4. do not continue until state is understood

---

### Session recovery
If broader state becomes unreliable:
1. stop further mutation
2. restore from session archive or Git checkpoint
3. re-establish known-good baseline
4. only then resume

---

## GITHUB SAFETY RULES

### GitHub must be used for:
- milestone commits
- accepted document checkpoints
- accepted code checkpoints
- recovery from later regressions

### GitHub must not be used for:
- committing broken intermediate states
- committing unreviewed AI output as trusted truth
- replacing local file backups during active mutation

### Rule
GitHub checkpointing complements local backup.
It does not replace immediate file-level recovery.

---

## OPEN BRAIN RELATIONSHIP

Open Brain stores verified reusable truth.
It does not replace:
- file backups
- packet logs
- GitHub checkpoint history

Update Open Brain only after:
- verification
- review
- approval

Never use Open Brain as a substitute for restore or rollback.

---

## FAILURE CONDITIONS

STOP immediately if:
- a mutation is attempted without backup
- a risky packet starts without logging
- a rerun is attempted without inspecting a prior ambiguous run
- a multi-layer change proceeds without appropriate recovery protection
- a broken state is about to be committed as a checkpoint

---

## CANONICAL OPERATING RULE

For every mutation:
1. identify exact targets
2. back up exact targets immediately before mutation
3. log the session visibly
4. perform one bounded mutation
5. verify immediately
6. inspect before rerun if output is ambiguous
7. approve or reject
8. capture reusable truth if appropriate
9. checkpoint accepted state in GitHub when logically complete

