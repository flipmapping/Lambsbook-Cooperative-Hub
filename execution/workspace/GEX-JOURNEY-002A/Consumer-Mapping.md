# Consumer Mapping

Implementation Authority:
GEX-JOURNEY-002B

Status:
FOUNDER DRAFT

## Constitutional Objective

Define how each runtime consumer uses the canonical journey specifications.

This document assigns responsibility for consuming business artifacts.
It does not introduce new business rules.

---

## Consumer Mapping

| Runtime Consumer | Journey State Model | Member Action Matrix | Communication Matrix | Consumer Responsibility |
|------------------|---------------------|----------------------|----------------------|-------------------------|
| Member Dashboard | Read | Read | No | Display current state and next required action |
| Timeline / Progress View | Read | Read | No | Visualize completed, current, and upcoming journey states |
| Resend Email Adapter | No | Read | Read | Deliver email communications defined by the communication matrix |
| Zalo Notification Adapter | No | Read | Read | Deliver Zalo communications defined by the communication matrix |
| Admissions Workspace | Read | Read | Read | Manage applicant progression and operational visibility |
| Organization Studio | Read | Read | Read | Configure and review journey definitions and operational processes |
| Analytics & Reporting | Read | Read | Read | Measure progression, conversion, and completion metrics |
| Automation / Scheduler | Read | Read | Read | Trigger communications and follow-up activities according to business events |

---

## Constitutional Rules

1. Runtime consumers SHALL NOT redefine journey states.
2. Runtime consumers SHALL NOT redefine member actions.
3. Runtime consumers SHALL consume communication definitions without changing business intent.
4. All behavioral consistency originates from the canonical specifications.
5. Any change to onboarding behavior must first be reflected in the canonical specifications before implementation.
