# GE-RMP-015 — WCS-GE-015-002 IMPLEMENTATION AUTHORITY

Status
------
FOUNDER AUTHORIZED

Purpose
-------
Provide a Gemini-generated SLL experience within Lambsbook English tutoring
for General English and IELTS preparation.

Authorized Runtime Files
------------------------
- client/src/components/sll/InteractiveProofOfMethod.tsx
- client/src/pages/LambsbookTutoring.tsx
- server/routes.ts
- server/services/sll-construction.ts

Boundaries
----------
- Do not show the SLL widget on /journeys/learn.
- Call Gemini only from the server using the GEMINI_API_KEY Replit secret.
- Follow the global English, Vietnamese, and Chinese language selection.
- Bound and validate input/output. Disclose Gemini processing.
- Do not persist or log prompts, answers, or learner evidence.
- Do not claim official IELTS scoring or learner mastery.
- Preserve SLL ontology, semantic controls, learner evidence, and curriculum
  authority. Add no database or analytics.

Verification
------------
Run the release guard and production build. Founder runtime review at
/hub/sbu/education/lambsbook-tutoring is required. No deploy or publish.

Current Status
--------------
DEPLOYMENT CANDIDATE — compiler build and founder preview review passed

Language coverage
-----------------
The global English, Vietnamese, or Chinese selection applies to all visible
copy on the Lambsbook Tutoring page, including the SLL experience.


Approved SLL access and resources
---------------------------------
- Visitors may generate up to three SLL examples per day.
- A regular Supabase user account unlocks unlimited SLL use; signup must not
  create canonical membership or use the member signup flow.
- Explain this benefit in the selected English, Vietnamese, or Chinese language.
- Link the free SLL ebook button to the founder-provided Google Drive folder.
- Do not persist prompts or generated answers.

Education program navigation
----------------------------
- Show the visitor SLL allowance and free regular-user signup benefit clearly.
- Add the Lambsbook Tutoring and SLL destination to the Education page Programs navigation.
- Keep regular user access distinct from canonical membership.

Public and member authentication navigation
--------------------------------------------
- Label regular-user signup and user sign-in separately from member sign-in.
- Explain in English, Vietnamese, and Chinese that joining as a member requires an invitation.
- client/src/pages/HubAuth.tsx — localized user/member authentication panel (EN/VI/ZH).

Founder Runtime Review
-----------------------
- Preview confirmed working after the HubAuth language initialization fix.
- User and member signup intro copy is localized for English, Vietnamese, and Chinese.
