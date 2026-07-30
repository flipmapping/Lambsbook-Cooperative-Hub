# APP-REC-056

LIVE RUNTIME EVIDENCE REQUIRED

Do NOT inspect more repository code.

Instead:

1. Open Browser DevTools
2. Select Network
3. Enable:
   - Preserve Log
   - Disable Cache

4. Start from a NEW invitation link.

5. Complete signup.

Capture these requests:

□ POST /api/member/onboarding/materialize-invitation
□ GET  /api/member/pending-invitation
□ POST /api/member/accept-invitation (if invoked)
□ GET  /api/member/me

For EACH request capture:

• Request URL
• Status Code
• Response JSON
• Any failed request highlighted in red

Also capture:

• Browser URL after signup
• Console errors (red only)

SUCCESS CRITERION

We can account for every transition:

invite token
    ↓
materialization
    ↓
pending invitation
    ↓
acceptance
    ↓
member/me

No repository mutation should occur before these runtime artifacts are reviewed.
