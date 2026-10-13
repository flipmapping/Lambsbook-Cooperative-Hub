# WCS Portfolio Review — Admin Notifications and User/Member Workspace

Status: Draft portfolio assessment for founder review

## Portfolio findings

| Work item | Evidence and current understanding | Relationship and sequencing |
| --- | --- | --- |
| WCS-GE-015-001 | Founder-approved Growth Engine work cycle; depends on MVP-WCS-002 and MVP-WCS-005. | Separate SLL stream; no dependency on Main App dashboard work identified. |
| WCS-GE-015-002 | Founder-approved SLL experience work cycle, dependent on WCS-GE-015-001. Founder reports redeployment and runtime review were successful. | Separate Growth Engine stream; no dashboard dependency identified. |
| APP-MEMBER-001 / APP-MEMBER-002 | Existing roadmap records canonical profile, member dashboard, profile completion, invitation, and relationship capabilities as completed. | Reuse the established MemberHub experience as the design baseline. Confirm relevant runtime behavior before changing it. |
| APP-MEMBER-003 | Defines relationship-centered dashboard and Community Square consumption of canonical profile/relationship data; its recorded acceptance items are checked. | Preserve the canonical relationship/profile model; do not duplicate identity or relationship authority. |
| APP-MEMBER-005 | Canonical member identity foundation/materialization. | Verify the live identity and entitlement contract before workspace implementation. |
| APP-MEMBER-008 Sprint 5 | Backlog includes profile projection, contact visibility, and Community Square discovery. | Overlaps the proposed public-profile scope; consolidate rather than duplicate. |
| APP-MEMBER-009 Sprint 5/6 | Backlog includes profile projection and Community Square visibility enforcement; prior evidence showed runtime verification unchecked. | Treat as planned/unverified until current evidence says otherwise; consolidate into WCS-APP-MEMBER-010. |
| APP-INV-001 | Canonical invitation journey covers signup, identity, invitation acceptance, member state, and relationships; it prohibits duplicate authorities. | Sole user-to-member transition path. |
| GE-RMP-014 | Existing Resend transport and preserved `sendNotification()` / `sendEmail()` contracts. | Reuse as transport authority; verify its current production contract. |
| GEX-NOTIFY-001 | Canonical notification intent/pipeline contracts. Its acceptance stage persists a pending intent and explicitly does not invoke a provider adapter at that stage. | Reuse the intent/pipeline authority; verify the separate delivery stage and runtime evidence. |
| WCS-APP-NOTIFY-001 | Draft P1 blocking predecessor. Admin template list/create/update and multilingual fields exist; preview, lifecycle, trigger accuracy, delivery outcomes, and failure recovery require verification or completion. | Complete and founder-verify this WCS before dashboard onboarding notification integration. |
| WCS-APP-MEMBER-010 | Draft P1 high-priority user/member workspace and public-profile experience. | Follows WCS-APP-NOTIFY-001 for notification integration and APP-MEMBER/APP-INV dependencies for identity, privacy, and conversion. |

## Evidence-based notification baseline

The admin dashboard has template list, create, and update controls, including English, Vietnamese, and Chinese content, approved variables, and a status field. The inspected API/storage excerpts show list/create/update. They do not establish preview, test-send, retirement behavior, runtime variable validation, or whether global middleware enforces administrator access.

The admin trigger matrix is embedded in the dashboard and includes LIVE and Planned labels. Verify LIVE entries against runtime evidence. GEX-NOTIFY-001 acceptance stops at a pending NotificationIntent before provider invocation; verify Resend delivery, persisted results, failures, and retry/idempotency behavior.

WCS-APP-NOTIFY-001 is intended to close these admin-management and delivery-verification gaps using the existing authorities. Required onboarding and security messages remain system-managed regardless of subscription or credit balance. Premium campaigns and credit-funded notification features are deferred to a later WCS.

## Email languages and AI-assisted authoring

WCS-APP-NOTIFY-001 supports English only, Vietnamese only, Chinese only, English and Vietnamese, or English and Chinese. AI suggestions cover each applicable subject and message field in selected languages, remain editable, and require administrator review before saving, activation, or sending. Identify the approved AI service and data-use authority before implementation; do not provide it recipient personal data. Define bilingual dispatch without silently duplicating emails.

## Recommended order

1. Approve a bounded implementation authority for WCS-APP-NOTIFY-001; complete and founder-verify admin authorization, template validation/preview/lifecycle, trigger accuracy, delivery outcomes, and failure recovery.
2. Verify APP-MEMBER-005 identity/entitlement behavior and APP-INV-001 invitation acceptance, and define the public-profile projection and default-private/opt-in visibility rules.
3. Implement WCS-APP-MEMBER-010’s role-aware workspace using the established MemberHub design, with member-only capabilities enforced by canonical server authorization.
4. Implement consent-based profile preview/projection and server-side visibility enforcement; connect Community Square to the canonical projection.
5. After WCS-APP-NOTIFY-001 passes founder runtime review, connect the required transactional onboarding messages. Verify invitation acceptance upgrades the same identity through APP-INV-001.
6. Define subscription- or credit-enabled notification services in a separate future WCS with explicit entitlement, consent, preferences, quota, usage, and failure-handling rules.

The SLL chain is independent and may continue separately. Neither draft WCS creates implementation authority; runtime changes require separate bounded authority.

## Open verification before implementation authorities

- Confirm the production identity and entitlement contract for APP-MEMBER-005 and invitation acceptance behavior for APP-INV-001.
- Confirm the current status of APP-MEMBER-009 and whether its visibility work is active, superseded, or unimplemented.
- Identify the existing admin middleware and verify it protects template and notification-management endpoints.
- Verify GE-RMP-014 and GEX-NOTIFY-001 contracts against the current runtime, especially the provider-delivery stage.
- Select the canonical public-profile URL/card contract and confirm private contact details cannot appear in public responses.
- An implementation-authority draft for WCS-APP-NOTIFY-001 is prepared but inactive. Reconcile the current work-cycle authority and verify the approved AI service/data-use authority before activation.
