# APP-NOTIFY-001 — Bounded Implementation Authority Draft

Status: ACTIVE — FOUNDER APPROVED  
Work cycle: WCS-APP-NOTIFY-001  
Approved scope source: execution/contracts/WORK-CYCLE-SPECIFICATION-APP-NOTIFY-001.json  
Active candidate base commit: 55adc27207bc567d956e9ecff4d46cb8a36f500e  
Prior cycle WCS-GE-015-002 reconciled: release gate passed; deployment provenance records runtime revision ff3b0ef2784829412cc66845e28e5824e5cb6db8.

## Purpose

Complete and runtime-verify administrator email-template and notification management using the existing Resend transport and canonical notification pipeline. This authority draft is limited to the approved WCS scope.

## Proposed authorized runtime files

- client/src/pages/HubAdminDashboard.tsx
- server/routes.ts
- server/storage.ts
- shared/schema.ts
- server/services/notifications.ts
- server/services/communication-resolution.ts
- server/services/admin-email-drafting.ts (new, server-side Gemini drafting endpoint)

Any additional runtime file discovered to be necessary requires an authority amendment before it is changed.

## Proposed deliverables

- Verify and complete server-side administrator authorization for notification-management endpoints.
- Complete multilingual template authoring for English only, Vietnamese only, Chinese only, English and Vietnamese, or English and Chinese.
- Support template create, save, preview, activation/retirement lifecycle, and administrator-initiated send as specified by the WCS.
- Validate template variables against approved event payloads and keep the trigger matrix aligned with runtime evidence.
- Connect approved notification intents to the existing Resend delivery stage and make delivery outcomes and failures auditable and recoverable.
- Provide AI suggestions for each subject/message field and selected language, with editable content and explicit administrator review before save, activation, or send.

## Mandatory gates

1. Reconcile the current work-cycle authority (WCS-GE-015-002, status DEPLOYMENT_CANDIDATE) before activating this authority. Do not overwrite another active cycle’s authority or release state.
2. Verify the existing Resend and notification-pipeline contracts and production status.
3. Use Google Gemini for template drafting as founder-approved. Verify the existing server-side Gemini integration and credential handling before implementation; send template subject/message text and language only, never recipient personal data. Do not create a provider account or add secrets.
4. If the required AI capability or any necessary runtime surface is outside this draft’s authority, stop and obtain an authority amendment.
5. No deployment or publication is authorized by this draft. Build, release checks, and founder runtime review must pass under the active authority before a separate release decision.

## Explicit exclusions

- Subscription, premium, or credit-funded notification services for users or members.
- Changes to identity, membership, invitation acceptance, or entitlement authorities.
- New notification provider, template, intent, or delivery authority.
- Runtime mutation while this document remains a draft.

## Approval boundary

This document records a proposed bounded authority only. It becomes active only after founder approval, work-cycle authority reconciliation, and satisfaction of the mandatory gates above.


## Activation note

Founder approved Google Gemini for administrator email-template drafting.
The existing Gemini key is server-side. The guest-facing SLL generation route
is not reused for admin drafting. Admin template routes must have verified
server-side administrator authorization. Draft inputs are limited to template
subject/message text and selected languages; recipient data is excluded.

Active baseline: 55adc27207bc567d956e9ecff4d46cb8a36f500e
