# CERTIFICATION REQUEST
## ZALO FOUNDATION 003A

Generated:
2026-07-23 05:03 UTC

STATUS
------
Founder Authority: COMPLETE
Founder Handoff: COMPLETE

AUTHORIZED DOCUMENTS
--------------------
execution/fabs/FAB-ZALO-FOUNDATION-003A.md

execution/handoffs/HANDOFF-ZALO-FOUNDATION-003A.md

EXECUTION STATUS
----------------
Awaiting implementation by the Execution Agent.

ARCHITECTURE CERTIFICATION SHALL BEGIN ONLY AFTER THE FOLLOWING EVIDENCE IS RETURNED:

1. server/integrations/zalo/webhook.ts
2. server/integrations/zalo/oauth.ts
3. Updated server/routes.ts
4. Successful npm run build output
5. HTTP 200 verification:
   - POST /api/integrations/zalo/webhook
   - GET /api/integrations/zalo/oauth/callback?code=test&state=test
6. git diff --stat
7. git status

NO FURTHER FOUNDER MUTATIONS ARE AUTHORIZED
UNTIL EXECUTION EVIDENCE IS RECEIVED.

END OF REQUEST
