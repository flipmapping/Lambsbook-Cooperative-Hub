# Journey State Model

Implementation Authority:
GEX-JOURNEY-002B

Status:
FOUNDER DRAFT

## Constitutional Objective

Define the canonical business states that describe how a prospect
progresses from first registration to active cooperative membership.

These states are business semantics.
They are independent of UI, notification providers, databases,
or implementation technology.

---

## Journey States

| State | Business Meaning | Entry Criteria | Exit Criteria | Success Event | Owner |
|------|-------------------|---------------|--------------|--------------|-------|
| Registered | Prospect successfully registered | Registration accepted | Identity verified | Email verified | Growth Engine |
| Identity Verified | Prospect identity trusted | Email verified | Community joined | Community joined | Growth Engine |
| Community Joined | Prospect engaged with community | Community joined | Profile completed | Profile completed | Growth Engine |
| Profile Complete | Ready for admissions review | Profile completed | Documents submitted | Documents submitted | Admissions |
| Documents Submitted | Ready for evaluation | Documents uploaded | Interview scheduled | Interview scheduled | Admissions |
| Interview Scheduled | Interview arranged | Interview booked | Interview completed | Interview completed | Admissions |
| Interview Completed | Awaiting decision | Interview completed | Admission decision recorded | Decision recorded | Admissions |
| Offer Issued | Admission offer available | Offer approved | Offer accepted | Offer accepted | Admissions |
| Member Activated | Cooperative member created | Membership activated | Journey complete | Member active | Main App |

---

## Constitutional Rules

1. A journey may occupy exactly one state at a time.
2. Every state has one measurable success event.
3. States never encode UI behaviour.
4. States never encode notification text.
5. Every downstream consumer derives behaviour from this model.
