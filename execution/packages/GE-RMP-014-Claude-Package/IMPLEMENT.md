# GE-RMP-014

Mission

Integrate the existing notification service with Resend while preserving
the canonical sendNotification()/sendEmail() runtime contract.

Execution Scope

- Verify existing notification service.
- Replace SMTP transport with Resend.
- Add reusable CTBC email templates.
- Wire prospect registration confirmation.
- Add Founder-triggered CTBC broadcast.
- Validate delivery.

Mutation Boundary

Only mutate:

- server/services/notifications.ts
- server/services/admissions.ts
- client/src/pages/ProspectRegistration.tsx
- package.json (already completed)

No constitutional authority changes.
No Builder changes.
No Open Brain changes.
