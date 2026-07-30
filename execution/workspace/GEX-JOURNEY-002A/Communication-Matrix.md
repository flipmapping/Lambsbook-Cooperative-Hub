# Communication Matrix

Implementation Authority:
GEX-JOURNEY-002B

Status:
FOUNDER DRAFT

## Constitutional Objective

Define the canonical communications that support each member action.

This document specifies the business communication requirements only.
It does not define implementation details, providers, APIs, or UI.

---

## Communication Matrix

| Journey State | Member Action | Business Trigger | Communication Purpose | Preferred Channels | Supported Languages | Success Event |
|---------------|---------------|------------------|-----------------------|--------------------|---------------------|---------------|
| Registered | Verify email address | Registration accepted | Confirm identity and welcome the prospect | Email | English, Vietnamese, Chinese | Email verified |
| Identity Verified | Join CTBC community | Identity verified | Encourage community participation | Email, Zalo | User selected language | Community joined |
| Community Joined | Complete personal profile | Community joined | Prepare admissions profile | Email, Zalo | User selected language | Profile completed |
| Profile Complete | Upload required documents | Profile completed | Request supporting documents | Email, Zalo | User selected language | Documents submitted |
| Documents Submitted | Schedule interview | Documents submitted | Arrange interview appointment | Email, Zalo | User selected language | Interview scheduled |
| Interview Scheduled | Attend interview | Interview confirmed | Remind applicant to attend | Email, Zalo | User selected language | Interview completed |
| Interview Completed | Review admission outcome | Decision available | Notify applicant of admission decision | Email | User selected language | Offer viewed |
| Offer Issued | Accept admission offer | Offer issued | Encourage enrollment | Email, Zalo | User selected language | Member activated |
| Member Activated | Activate cooperative membership | Membership activated | Welcome new member | Email, Zalo | User selected language | Membership activated |

---

## Constitutional Rules

1. Every communication supports one business objective.
2. Communications are triggered by business events.
3. Language follows the member's selected language.
4. Channel selection is a business preference and independent of implementation.
5. Runtime notification services consume this matrix without redefining business intent.
