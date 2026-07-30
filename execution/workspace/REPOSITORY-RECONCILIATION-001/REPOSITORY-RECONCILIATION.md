
# REPOSITORY-RECONCILIATION-001

Created
-------

2026-07-30 02:11 UTC

Purpose
-------

Reconcile the local repository with its tracked remote before beginning
new implementation work.

Repository
----------

Current Branch:
app-rec-006-runtime-identity

HEAD SHA:
d9b072afc1fecdeccfe0f5010244f4c98f07dec1

Tracked Upstream:
fatal: no upstream configured for branch 'app-rec-006-runtime-identity'

Ahead / Behind:
fatal: no upstream configured for branch 'app-rec-006-runtime-identity'

Working Tree
------------

On branch app-rec-006-runtime-identity
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   client/src/components/dashboard/InvitationAcceptanceSection.tsx
	modified:   client/src/components/notifications/ChannelSelector.tsx
	modified:   client/src/components/notifications/NotificationPreferencesPanel.tsx
	modified:   client/src/pages/HubAuth.tsx
	modified:   client/src/pages/HubAuthCallback.tsx
	deleted:    docs/implementation-evidence/PHASE-1-BASELINE/MemberHub.pre-mutation.tsx
	modified:   execution/builder/delivery/generated-cib/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md
	modified:   execution/packages/GE-RMP-014-Claude-Package.zip
	modified:   execution/packages/GE-RMP-014-Claude-Package.zip.sha256
	modified:   execution/packages/GE-RMP-014-Claude-Package/PACKAGE-MANIFEST.md
	modified:   governance/execution-derivation/generated/EXECUTION-DERIVATION.md
	modified:   package-lock.json
	modified:   package.json
	deleted:    recovery/websocket_contract_fix/RECOVERY_MANIFEST.txt
	deleted:    recovery/websocket_contract_fix/websocket_cluster_collapse_execution_v3.cjs
	deleted:    recovery/websocket_contract_fix/websocket_cluster_collapse_final_execution.cjs
	deleted:    recovery/websocket_contract_fix/websocket_contract_fix_execution_reconstructed.js
	deleted:    recovery/websocket_contract_fix/websocket_contract_fix_execution_v2_reconstructed.js
	deleted:    recovery/websocket_contract_fix/websocket_execution_artifact_upgrade.cjs
	deleted:    recovery/websocket_contract_fix/websocket_execution_artifact_upgrade.js
	deleted:    recovery/websocket_contract_fix/websocket_execution_artifact_upgrade_recovery.cjs
	deleted:    runner/workspace/claude-phase5-workpackage1.zip
	modified:   server/imports/pipeline/persist.ts
	modified:   server/lib/supabase-dal.ts
	modified:   server/middleware/attachUserContext.ts
	modified:   server/routes.ts
	modified:   server/routes/member.ts
	deleted:    server/services/admissions.ts.pre-ge-comm-001-g20
	deleted:    server/services/admissions.ts.pre-ge-rmp-014-g11
	deleted:    server/services/admissions.ts.pre-ge-rmp-014-g7
	modified:   server/services/notifications.ts
	deleted:    server/services/notifications.ts.pre-ge-rmp-014
	deleted:    server/services/notifications.ts.pre-ge-rmp-014-g4
	modified:   shared/schema.ts
	modified:   src/lib/memberClient.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.app-rec-031-awaiting-runtime
	APP-REC-020-Claude-Package.zip
	APP_REC_007_reorder.patch
	client/src/features/
	client/src/pages/HubAuthCallback.tsx.REORDER_CANDIDATE
	execution/adapters/
	execution/automation/
	execution/builder-execution/
	execution/builder-working-tree/
	execution/builder/README.md
	execution/builder/activate.py
	execution/builder/activation.json
	execution/builder/builder-certification.json
	execution/builder/builder-spec.json
	execution/builder/builder.py
	execution/builder/context.py
	execution/builder/delivery/recovery-truth-table.json
	execution/builder/derive_pic.py
	execution/builder/execution-plan.json
	execution/builder/pipeline.py
	execution/builder/register_builder.py
	execution/builder/registration.json
	execution/builders/recovery/
	execution/certifications/GP-EXEC-010M-09/
	execution/checkpoints/EXECUTION-CHECKPOINT.json
	execution/compiler/
	execution/compliance/
	execution/contracts/checkpoint/
	execution/engines/
	execution/evidence/GP-EXEC-009/
	execution/evidence/GP-EXEC-010/
	execution/git-verification/
	execution/governance/EER-GEX-EXEC-001.md
	execution/handoffs/APP-REC-003C/
	execution/implementation-planning/
	execution/implementation/
	execution/inspection/
	execution/merge/
	execution/packages/APP-REC-019B/
	execution/packages/APP-REC-020/
	execution/packages/APP-REC-029/
	execution/packages/GE-RMP-014-Claude-Package/START-HERE.md
	execution/packages/GE-RMP-014-Claude-Package/governance/BASELINE.md
	execution/packages/GE-RMP-014-Claude-Package/governance/cib/generated/CIB-GE-RMP-014-MAIN-APPLICATION-RECOVERY.md
	execution/packages/GE-RMP-014-Claude-Package/governance/execution-derivation/
	execution/packages/GE-RMP-014-Claude-Package/governance/execution/
	execution/packages/GE-RMP-014-Claude-Package/governance/startup/
	execution/packages/GP-EXEC-009_IMPLEMENTATION_PACKAGE.zip
	execution/packages/GP-EXEC-009_IMPLEMENTATION_PACKAGE/
	execution/packages/GP-EXEC-010M-06A/
	execution/packages/_builder_certification/
	execution/recovery/
	execution/registry/stream-registry.json
	execution/released-baselines/
	execution/tools/
	execution/workspace/APP-COM-001/
	execution/workspace/APP-COM-002/
	execution/workspace/APP-COM-003/
	execution/workspace/APP-COM-004/
	execution/workspace/APP-COM-EXEC-001/
	execution/workspace/APP-COM-EXEC-LOG-001/
	execution/workspace/APP-COM-IMP-001/
	execution/workspace/APP-COM-IMP-001A/
	execution/workspace/APP-COM-INTEGRATION-001/
	execution/workspace/APP-COM-INTEGRATION-002/
	execution/workspace/APP-COM-NEXT-SPRINT/
	execution/workspace/APP-COM-RELEASE-001/
	execution/workspace/APP-COM-SPRINT-BOARD-001/
	execution/workspace/APP-MEMBER-001/
	execution/workspace/APP-MEMBER-002/
	execution/workspace/APP-MEMBER-003/
	execution/workspace/APP-MEMBER-004/
	execution/workspace/APP-MEMBER-005/
	execution/workspace/APP-MEMBER-006/
	execution/workspace/APP-MEMBER-007/
	execution/workspace/APP-MEMBER-008/
	execution/workspace/APP-MEMBER-009/
	execution/workspace/APP-MEMBER-010/
	execution/workspace/APP-MEMBER-011/
	execution/workspace/APP-MEMBER-012/
	execution/workspace/APP-MEMBER-013/
	execution/workspace/APP-MEMBER-014/
	execution/workspace/APP-MEMBER-015/
	execution/workspace/APP-MEMBER-016/
	execution/workspace/APP-READY-002/
	execution/workspace/APP-REC-018C-20260726T153726Z-attachUserContext.ts
	execution/workspace/APP-REC-RPC-INSPECTION/
	execution/workspace/APP-REC/
	execution/workspace/ARCH-HANDOFF-002B/
	execution/workspace/COM-ARCH-002/
	execution/workspace/EMP-001A/
	execution/workspace/EMP-001B/
	execution/workspace/EMP-001C/
	execution/workspace/EMP-001D/
	execution/workspace/EMP-001E/
	execution/workspace/EMP-001F/
	execution/workspace/EMP-001M-01/
	execution/workspace/EMP-001M-02/
	execution/workspace/EMP-001M-06/
	execution/workspace/EMP-001M-07/
	execution/workspace/EMP-001M-08/
	execution/workspace/EMP-002/
	execution/workspace/EXECUTION-BASELINE-001/
	execution/workspace/GEX-001M-11A/
	execution/workspace/GEX-001M-13B/
	execution/workspace/GEX-001M-15B/
	execution/workspace/GEX-001M-35/
	execution/workspace/GEX-001M-38/
	execution/workspace/GEX-001M-41/
	execution/workspace/GEX-001M-45/
	execution/workspace/GEX-001M-47/
	execution/workspace/GEX-001M-48/
	execution/workspace/GEX-001M-49/
	execution/workspace/GEX-001M-50/
	execution/workspace/GEX-001M-51/
	execution/workspace/GEX-001M-52/
	execution/workspace/GEX-001M-54/
	execution/workspace/GEX-001M-55/
	execution/workspace/GEX-001M-62/
	execution/workspace/GEX-001M-63/
	execution/workspace/GEX-001M-78/
	execution/workspace/GEX-001M-79/
	execution/workspace/GEX-001M-80/
	execution/workspace/GEX-001M-81/
	execution/workspace/GEX-001M-89B/
	execution/workspace/GEX-001M-90/
	execution/workspace/GEX-001M-91A/
	execution/workspace/GEX-001M-92C/
	execution/workspace/GEX-001M-92F/
	execution/workspace/GEX-001M-93/
	execution/workspace/GEX-001M-93A/
	execution/workspace/GEX-BUILD-001/
	execution/workspace/GEX-CLOSE-001G/
	execution/workspace/GEX-CLOSE-001H/
	execution/workspace/GEX-CLOSE-001J/
	execution/workspace/GEX-EXEC-001/
	execution/workspace/GEX-EXEC-004/
	execution/workspace/GEX-EXEC-005/
	execution/workspace/GEX-EXEC-006/
	execution/workspace/GEX-JOURNEY-002A-Release.sha256
	execution/workspace/GEX-JOURNEY-002A-Release.zip
	execution/workspace/GEX-JOURNEY-002A/
	execution/workspace/GEX-NOTIFY-001/
	execution/workspace/GP-EXEC-009/
	execution/workspace/GP-EXEC-009B/
	execution/workspace/GP-EXEC-009C-08/
	execution/workspace/GP-EXEC-009C/
	execution/workspace/GP-EXEC-014M-14A-backup/
	execution/workspace/GP-EXEC-015A/
	execution/workspace/GP-EXEC-015B/
	execution/workspace/GP-EXEC-015C/
	execution/workspace/GP-EXEC-015D/
	execution/workspace/GP-EXEC-015E/
	execution/workspace/GP-EXEC-015F-R1/
	execution/workspace/GP-EXEC-015F-R2/
	execution/workspace/GP-EXEC-015F/
	execution/workspace/GP-EXEC-015G/
	execution/workspace/GP-EXEC-015H/
	execution/workspace/GP-EXEC-015I/
	execution/workspace/GP-EXEC-015J/
	execution/workspace/GP-EXEC-015K/
	execution/workspace/GP-EXEC-015L/
	execution/workspace/GP-EXEC-016/
	execution/workspace/GP-EXEC-017/
	execution/workspace/GP-EXEC-018/
	execution/workspace/GP-EXEC-019/
	execution/workspace/GP-EXEC-020/
	execution/workspace/GP-EXEC-020A/
	execution/workspace/ORG-001A-01/
	execution/workspace/ORG-001A-02/
	execution/workspace/ORG-001A-03/
	execution/workspace/ORG-001B-01/
	execution/workspace/ORG-001B-02/
	execution/workspace/ORG-001C-01/
	execution/workspace/ORG-001C-02/
	execution/workspace/ORG-001D-01/
	execution/workspace/ORG-001D-02/
	execution/workspace/ORG-001D-03/
	execution/workspace/ORG-001E-01/
	execution/workspace/ORG-001E-02/
	execution/workspace/ORG-001E-03/
	execution/workspace/ORG-001F-01/
	execution/workspace/ORG-001F-02/
	execution/workspace/ORG-001F-03/
	execution/workspace/ORG-001F-04/
	execution/workspace/ORG-001F-05/
	execution/workspace/ORG-001F-06/
	execution/workspace/ORG-001F-07/
	execution/workspace/ORG-001F-08/
	execution/workspace/ORG-001F-09/
	execution/workspace/ORG-COM-003/
	execution/workspace/ORG-COM-004/
	execution/workspace/ORG-COM-005/
	execution/workspace/ORG-COM-EXEC-001/
	execution/workspace/ORG-COM-EXEC-002/
	execution/workspace/ORG-COM-EXEC-003/
	execution/workspace/ORG-COM-EXEC-005/
	execution/workspace/ORG-COM-EXEC-006/
	execution/workspace/ORG-COM-EXEC-007/
	execution/workspace/ORG-COM-EXEC-008/
	execution/workspace/ORG-COM-EXEC-009/
	execution/workspace/ORG-COM-EXEC-010/
	execution/workspace/ORG-DEMO-002/
	execution/workspace/ORG-DEMO-003/
	execution/workspace/ORG-DEMO-004/
	execution/workspace/ORG-DEMO-004A/
	execution/workspace/ORG-DEMO-005/
	execution/workspace/ORG-DEMO-006/
	execution/workspace/ORG-DEMO-007/
	execution/workspace/ORG-EXEC-001/
	execution/workspace/ORG-EXEC-002/
	execution/workspace/ORG-IMP-001/
	execution/workspace/ORG-IMP-002/
	execution/workspace/ORG-MVP-001D/
	execution/workspace/SPRINT-CONTROL-BOARD-001/
	execution/workspace/SPRINT-EXECUTION-001/
	execution/workspace/truth_registry/
	governance/decisions/
	governance/deferred/
	governance/rmp/GE-RMP-014-IMPLEMENTATION-AUTHORITY.md
	home/
	repository_cleanup_candidates.txt
	repository_cleanup_manifest.txt
	repository_decision_matrix.md
	repository_hygiene_stage1_report.md
	repository_impact_audit.md
	server/imports/adapters/
	server/imports/domain/
	server/imports/mappers/prospectRegistration.ts.pre-GEX001M30
	server/imports/pipeline/duplicates.ts
	server/imports/pipeline/index.ts
	server/imports/pipeline/normalize.ts
	server/imports/pipeline/persist.ts.pre-GEX001M22
	server/imports/pipeline/persist.ts.pre-GEX001M26
	server/imports/pipeline/persist.ts.pre-GEX001M37
	server/imports/pipeline/report.ts
	server/imports/pipeline/runImportPipeline.ts
	server/imports/pipeline/smoke.ts
	server/imports/pipeline/stage.ts
	server/imports/pipeline/validate.ts
	server/imports/reporting/
	server/imports/staging/
	server/imports/validation/
	server/integrations/zalo/adapter.ts
	server/integrations/zalo/auth.ts
	server/messaging/
	server/services/admissions.ts.pre-GEX001M10
	server/services/admissions.ts.pre-GEX001M11
	server/services/admissions.ts.pre-GEX001M15D
	server/services/admissions.ts.pre-GEX001M17
	server/services/admissions.ts.pre-GEX001M21
	shared/organization/
	tcrs/06-discoveries/DISC-ROUTE-001-canonical-member-router.md
	tools/capture_invitation_api_contract.md
	tools/identity_corridor_inventory.py
	tools/implementation_readiness_check.py
	tools/repository_decision_matrix.py
	tools/repository_hygiene_stage1.py
	tools/repository_impact_audit.py
	tools/runtime_surface_verification.py
	tools/stage2_cleanup_candidates.py
	tools/stage2_cleanup_execute.py
	tools/verify_invitation_journey.py

no changes added to commit (use "git add" and/or "git commit -a")

Fetch Result
------------



Decision Checklist
------------------

□ Are all local changes intentional?

□ Is the working tree clean?

□ Is the correct branch checked out?

□ Is the local branch synchronized with its upstream?

□ If not synchronized, determine whether to commit, push, pull, or rebase.

Authorization
-------------

Do not begin new implementation until the repository state has been
reviewed and accepted.
