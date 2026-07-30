# Member Action Matrix

Implementation Authority:
GEX-JOURNEY-002B

Status:
FOUNDER DRAFT

## Constitutional Objective

Define the required member action for each journey state.

This document specifies what the member is expected to do next.
It contains no implementation details, notification logic, or UI behavior.

---

## Member Action Matrix

| Journey State | Required Member Action | Cooperative Objective | Success Event | Responsible Team |
|---------------|------------------------|-----------------------|---------------|------------------|
| Registered | Verify email address | Confirm identity | Email verified | Growth Engine |
| Identity Verified | Join CTBC community | Initial engagement | Community joined | Growth Engine |
| Community Joined | Complete personal profile | Admission readiness | Profile completed | Admissions |
| Profile Complete | Upload required documents | Application completeness | Documents submitted | Admissions |
| Documents Submitted | Schedule interview | Candidate evaluation | Interview scheduled | Admissions |
| Interview Scheduled | Attend interview | Complete assessment | Interview completed | Admissions |
| Interview Completed | Review admission outcome | Decision acknowledgement | Offer viewed | Admissions |
| Offer Issued | Accept admission offer | Enrollment conversion | Member activated | Admissions |
| Member Activated | Activate cooperative membership | Active cooperative participation | Member activated | Main App |

---

## Constitutional Rules

1. Every journey state has exactly one primary required member action.
2. Every action advances a measurable cooperative objective.
3. Every action has one observable success event.
4. Runtime implementations consume this matrix and SHALL NOT redefine member actions.
