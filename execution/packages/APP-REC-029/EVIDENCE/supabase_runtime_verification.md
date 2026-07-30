# APP-REC-063

Runtime Verification Checklist

## Step 1 — Verify CLI

Run:

    supabase --version

Expected:
- CLI version displayed.

---

## Step 2 — Verify Link

Run:

    supabase status

Capture the complete output.

---

## Step 3 — If status succeeds

Run:

    supabase db query < execution/packages/APP-REC-029/EVIDENCE/verify_invitation_rpcs.sql

Capture:

- stdout
- stderr
- exit code

---

Decision Matrix

A.
Functions returned
→ Export their definitions.

B.
Zero rows
→ Repository and live database are out of sync OR functions were never deployed.

C.
CLI not linked
→ Link the project before any further investigation.

D.
Authentication / network error
→ Resolve environment access first.
