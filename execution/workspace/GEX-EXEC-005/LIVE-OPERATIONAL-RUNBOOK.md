# GEX-EXEC-005 Live Operational Runbook

Objective:
Perform one real admissions stage transition and collect evidence.

Execution Checklist:

1. Ensure required runtime configuration is available.
2. Start the application.
3. Authenticate as a user able to perform a stage transition.
4. Execute one admissions stage transition.
5. Capture:
   - HTTP request
   - HTTP response
   - Relevant server log
   - Notification persistence evidence
6. Place the captured evidence into:
   execution/workspace/GEX-EXEC-004/runtime-evidence/
7. Submit the evidence for Growth Engine review.

Success Criteria:

- Stage transition succeeds.
- Existing workflow is unaffected.
- One notification publication is observed for the request.
- Any delivery failure is graceful and does not affect the API response.
