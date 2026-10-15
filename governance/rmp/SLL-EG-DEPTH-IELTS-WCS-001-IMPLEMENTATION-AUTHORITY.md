# SLL-EG-DEPTH-IELTS-WCS-001 Implementation Authority

Status
------
FOUNDER AUTHORIZED

Work Cycle
----------
SLL-EG-DEPTH-IELTS-WCS-001

Approval
--------
The founder approved implementation in conversation on 2026-10-15.

Authorized Runtime File
-----------------------
- client/src/components/sll/InteractiveProofOfMethod.tsx

Authorized Change
-----------------
Add the approved collapsed “How to Use Example Depth” explanation in English,
Vietnamese, and Chinese, following the existing global language selection.

Boundaries
----------
- Explanatory content only.
- Do not change depth selection behavior, generation prompts, output, or API.
- Do not change server behavior, storage, database, analytics, or SLL ontology.
- Do not claim IELTS score or CEFR equivalence.
- Redeployment is authorized only for the isolated SLL Example Depth feature release.

Verification
------------
- Run the authorized work-cycle gate and production build.
- Founder runtime review must confirm the disclosure works in all three
  languages without triggering generation or changing the selected depth.

Current Status
--------------
AUTHORIZED FOR BOUNDED UI IMPLEMENTATION; DEPLOYMENT NOT AUTHORIZED



Deployment Approval
-------------------
The founder approved redeployment of this isolated feature on 2026-10-15.
The release branch is based on the recorded production runtime revision and
contains only the SLL Example Depth UI runtime change. Notification-template
runtime changes are excluded. Publish only after the deploy gate passes.
