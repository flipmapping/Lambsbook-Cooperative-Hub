# APP-REC-055
# Invitation Materialization Runtime Verification

After reproducing a NEW invited-member signup, capture the following from
Browser DevTools → Network.

=========================================================
REQUEST 1
=========================================================

POST /api/member/onboarding/materialize-invitation

Record:

- Status Code
- Response Body
- Response Headers (if useful)

=========================================================
REQUEST 2
=========================================================

GET /api/member/pending-invitation

Record:

- Status Code
- Response JSON

Expected canonical possibilities:

{
  "has_pending_invitation": true,
  "invitation": {...}
}

OR

{
  "has_pending_invitation": false,
  "invitation": null
}

=========================================================
REQUEST 3
=========================================================

POST /api/member/accept-invitation

If this request occurs automatically or manually,
capture:

- Status
- Response JSON

=========================================================
REQUEST 4
=========================================================

GET /api/member/me

Capture the response immediately AFTER invitation acceptance.

=========================================================
DELIVERABLES
=========================================================

1. Screenshot of Network entries
2. Preview/Response of each request
3. Console errors (only if red)

Do NOT modify any source files before reviewing these results.
