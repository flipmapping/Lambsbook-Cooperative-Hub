# REP-STEWARD-018 Dead-Artifact Validation Report

- Audit time (UTC): 2026-10-15T07:50:52.244827+00:00
- Branch / revision: `rep-steward-018-dead-artifact-validation` / `17f937c963a7685f1a67526d25d3170d6e8535a6`
- Scope: read-only candidate validation.
- Cleanup performed: **No**.
- Cleanup authority: **Not granted**.
- Cleanup scripts: statically inspected only; not executed.
- Secret values: not read. Ignored and secret-related paths are recorded as metadata only.
- External paths: not followed.

## Current inventory

- Tracked paths: 4786.
- Untracked paths: 0.
- Ignored paths: 53492 (full path metadata is in the candidate register).
- Secret-related paths found by filename pattern: 494 (metadata only; pattern may produce false positives).

## Candidate dispositions

Assessed 54 entries from `execution/git-verification/GP-EXEC-010M-06A/repository_cleanup_candidates.txt`. The old cleanup manifest is historical evidence only and was not treated as current state.

| Disposition | Count |
|---|---:|
| PROTECTED | 4 |
| ACTIVE | 0 |
| REVIEW | 0 |
| MISSING | 50 |
| UNKNOWN | 0 |

| Candidate path | Current status | Disposition | Confidence |
|---|---|---|---|
| `_final_backup_quarantine/.replit.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/App.tsx.pre-lazyload.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/CountriesSection.tsx.pre-webp.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/HeroSection.tsx.pre-webp.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/InvitationAcceptancePage.tsx.pre-ux-clean.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/JobCategoriesSection.tsx.pre-webp.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/MemberDashboard.tsx.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/MemberHub.tsx.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/MemberHub.tsx.loading_gate.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/REGISTRY_INDEX.md.corrupted.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/StudyAbroadSection.tsx.pre-webp.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/SuccessStories.tsx.pre-webp.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/build.ts.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/detect-dead-strata.cjs.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/detect-runtime-backups.cjs.pre-scope.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/enforce-canonical-runtime.cjs.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/enforce-canonical-runtime.cjs.pre-self-exclude.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/member.ts.app_rec_invite_001g.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/member.ts.app_rec_invite_001j.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/member.ts.pre-error-restore.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/member.ts.pre-log-clean.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/routes.ts.login_restore.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/schema.ts.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `_final_backup_quarantine/supabase-hub.ts.login_session_fix.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `docs/implementation-evidence/PHASE-1-BASELINE/MemberHub.pre-mutation.tsx` | PRESENT / TRACKED | PROTECTED | HIGH |
| `execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md.candidate` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md.pre-gex-rec-004.20260723T142558Z` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md.pre-gex-rec-020.20260723T162447Z` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md.pre-gex-rec-020.20260723T162600Z` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md.pre-gex-rec-021.20260723T161313Z` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md.pre-gex-rec-021.20260723T161615Z` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md.pre-recovery.20260723T135347Z` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/builders/recovery` | PRESENT / TRACKED | PROTECTED | HIGH |
| `execution/implementation-evidence/gex001/HeroContent.pre-mutation.20260716T092239Z.txt` | PRESENT / TRACKED | PROTECTED | HIGH |
| `execution/packages/GE-RMP-014-Claude-Package/implementation-patch/admissions.ts.pre-g17` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/packages/GE-RMP-014-Claude-Package/implementation-patch/admissions.ts.pre-g19` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/packages/GE-RMP-014-Claude-Package/implementation-patch/admissions.ts.pre-g9` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `execution/recovery` | PRESENT / TRACKED | PROTECTED | HIGH |
| `execution/sprints/APP-REC-005/apply_stage1_gate.py.placeholder.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `governance/cib/generated/CIB-GE-RMP-004-RELEASE1-JOURNEY-INTEGRATION.md.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/backups/admin.ts.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/backups/supabase-dal.ts.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/hubdashboard_implicit_any_cluster_rollback/HubDashboard.tsx.pre_implicit_any_fix.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/routes_typing_cluster_rollback/routes.ts.pre_routes_typing_fix.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/top_level_await_cluster_rollback/index.ts.pre_top_level_await_fix.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/websocket_contract_fix/websocket_cluster_collapse_execution_v3.pre_impl.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/websocket_contract_fix/websocket_cluster_collapse_execution_v3.scaffold.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/websocket_contract_fix/websocket_cluster_collapse_final_execution.pre_codegen.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `recovery/websocket_contract_fix/websocket_cluster_collapse_final_execution.pre_logic.bak` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `server/services/admissions.ts.pre-ge-comm-001-g20` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `server/services/admissions.ts.pre-ge-rmp-014-g11` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `server/services/admissions.ts.pre-ge-rmp-014-g7` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `server/services/notifications.ts.pre-ge-rmp-014` | ABSENT / NOT_TRACKED | MISSING | HIGH |
| `server/services/notifications.ts.pre-ge-rmp-014-g4` | ABSENT / NOT_TRACKED | MISSING | HIGH |

## Static cleanup-script review

Both scripts were parsed and inspected as source text only. Neither was executed.

- Candidate generator: `execution/git-verification/GP-EXEC-010M-06A/tools/stage2_cleanup_candidates.py`; SHA-256 `3d87b7edc3e4b2d322c7b32b4e020d223d7e2df8a836049b0932771a988c2857`. It uses recursive `ROOT.rglob` discovery with these configured patterns: `["*.candidate", "*.pre-*", "*.bak"]`. It excludes paths whose parts contain `.git`.
- Cleanup executor: `execution/git-verification/GP-EXEC-010M-06A/tools/stage2_cleanup_execute.py`; SHA-256 `c66b2d76915e3d318bb480cc700bb7c72dca79205a6212f6d107c6c671201cc3`. It recursively walks `ROOT.rglob("*")`, skips `.git` and preserved prefixes `["execution/builders/recovery", "execution/implementation-evidence", "execution/packages", "execution/recovery"]`, then selects paths by any configured prefix `["_final_backup_quarantine", "recovery/backups", "recovery/hubdashboard_implicit_any_cluster_rollback", "recovery/routes_typing_cluster_rollback", "recovery/top_level_await_cluster_rollback", "recovery/websocket_contract_fix"]`, suffix `[".candidate", ".bak"]`, or contained name token `[".pre-"]`.
- Its deletion helper calls `shutil.rmtree` on directories and `Path.unlink` on files. The source has no per-item confirmation step. This broad matching and recursive deletion behavior makes the executor unsuitable for this read-only validation cycle.
- Exact traversal and deletion call line numbers are recorded in the machine-readable register.
- Candidate dispositions: 50 historical paths are missing; 4 present candidates are protected because they or their descendants are tracked. Their repository references are recorded in the register. No deletion recommendation is made.

## Historical evidence

Earlier July reports and the prior cleanup manifest are stale snapshots. They do not establish current existence, ownership, safety, or deletion eligibility.
- `execution/workspace/REP-STEWARD-009/Repository-Stewardship-Baseline.md` — TRACKED; SHA-256 `e2d36dd006cb1cbe5d32e9b4917c867886844691db624b519aba04f570409478`.
- `execution/git-verification/GP-EXEC-010M-06A/repository_cleanup_manifest.txt` — TRACKED; SHA-256 `8b47355e260438a01b2df686ebffbb638e862a6d40d7410df137b119606391e0`.
- `execution/workspace/REP-STEWARD-007/repository-contamination-register.json` — TRACKED; SHA-256 `e538ecdbc338c8a08dd1d3d9f7f1f5fed338a44f767f41243498d5a3d428937c`.

## Decision boundary

A disposition or recommendation is not authorization to delete, move, rename, archive, or ignore any path. Any cleanup requires a separate, itemized WCS and authority. Uncertain ownership, references, or recovery value must remain under review.

## Evidence limitations

The exact-path reference search cannot prove that a path is unused by dynamic code, external tooling, or undocumented recovery procedures. `REVIEW` is not a deletion recommendation. Filename-based secret detection can miss secrets and can produce false positives.
