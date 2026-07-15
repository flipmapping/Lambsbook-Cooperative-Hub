# GE-RMP-014 IMPLEMENTATION AUTHORITY

Implementation
--------------
CTBC Recruitment Email Enablement

Mission
-------
Integrate the existing notification service with Resend while preserving
the canonical sendNotification()/sendEmail() runtime contract.

Authorized Mutation Surfaces
----------------------------
- server/services/notifications.ts
- server/services/admissions.ts
- client/src/pages/ProspectRegistration.tsx

Execution Constraints
---------------------
- Preserve existing runtime contracts.
- Reuse sendNotification().
- Reuse sendEmail().
- Do not introduce a parallel email service.
- Do not modify constitutional authorities.
- Do not modify Builder.
- Do not modify Open Brain.

Deliverables
------------
- Reusable CTBC email templates.
- Registration confirmation email.
- Founder broadcast email capability.
- Delivery validation evidence.
