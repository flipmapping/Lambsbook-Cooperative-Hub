# APP-REC-062

OBJECTIVE
---------

Verify that the local Supabase CLI is connected to the SAME project used by
the running application before executing any database inspection.

STEP 1
------

Run:

    supabase status

Record:

- Project Ref
- API URL
- Database URL (if shown)

STEP 2
------

Compare the reported Project Ref / URL with:

- web/.env.local
- supabase/config.toml

STEP 3
------

If they match:

Execute:

    supabase db query < execution/packages/APP-REC-029/EVIDENCE/verify_invitation_rpcs.sql

If they do NOT match:

Do NOT continue.

Relink the CLI to the correct Supabase project first.

SUCCESS CRITERIA
----------------

One verified database connection.

No assumptions.
No schema mutation.
No deployment.
Only verified runtime truth.
