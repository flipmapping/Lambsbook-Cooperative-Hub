# EXECUTION HANDOFF
## ZALO FOUNDATION 003A

STATUS
------
Founder Authority: APPROVED

AUTHORIZED IMPLEMENTATION
-------------------------
Reference:

execution/fabs/FAB-ZALO-FOUNDATION-003A.md

EXECUTION AGENT RESPONSIBILITIES
--------------------------------
Implement ONLY the authorized mutation.

Return the following evidence:

1. Files Created
   - server/integrations/zalo/webhook.ts
   - server/integrations/zalo/oauth.ts

2. Files Modified
   - server/routes.ts

3. Build Evidence
   - Complete output from:
       npm run build

4. Runtime Verification
   - HTTP response from:
       POST /api/integrations/zalo/webhook

   - HTTP response from:
       GET /api/integrations/zalo/oauth/callback?code=test&state=test

5. Git Evidence
   - git status
   - git diff --stat
   - commit hash (if committed)

CERTIFICATION GATE
------------------
No additional implementation is authorized until the Architecture stream certifies:

- mutation boundary respected
- build successful
- both endpoints return HTTP 200
- no unrelated files changed

END OF HANDOFF
