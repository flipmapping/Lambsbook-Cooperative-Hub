# APP-REC-066

Mission
=======

Restore compatibility between the local Supabase CLI and the repository.

Current State
-------------

✓ CLI installed
✗ CLI version incompatible with repository config
✗ Cannot execute runtime database inspection

Execution Checklist
-------------------

1. Upgrade Supabase CLI to the latest v2 release.

2. Verify:

    supabase --version

Expected:
    Major version = 2

3. Verify repository:

    supabase status

Expected:
    No config parsing errors.

4. Verify project linkage.

5. Execute:

    supabase db query < execution/packages/APP-REC-029/EVIDENCE/verify_invitation_rpcs.sql

Evidence to capture
-------------------

- supabase --version
- supabase status
- SQL query output
- Exit codes

Decision
--------

If RPCs exist:
    Export CREATE FUNCTION definitions.

If RPCs do not exist:
    Certify deployment/schema drift.

If CLI still cannot parse config:
    Resolve CLI installation before continuing.
