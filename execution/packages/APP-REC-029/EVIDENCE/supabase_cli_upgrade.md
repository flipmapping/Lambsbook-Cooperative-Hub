# APP-REC-065

Objective
---------

Upgrade the local Supabase CLI to a version compatible with this repository.

Current findings:
- Installed CLI: v1.168.1
- Repository config expects a newer CLI (supports db.major_version = 17).
- `supabase status` fails during config parsing.
- `supabase db query` is unavailable in this CLI.

After upgrading:

1. Verify:

    supabase --version

2. Verify project:

    supabase status

3. Execute:

    supabase db query < execution/packages/APP-REC-029/EVIDENCE/verify_invitation_rpcs.sql

Expected outcome:

- CLI parses config successfully.
- Project status is available.
- RPC existence can be verified against the live database.
