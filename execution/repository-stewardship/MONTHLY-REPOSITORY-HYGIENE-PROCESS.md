# Monthly Repository Hygiene Process

Status
------
Implemented under REP-STEWARD-027-WCS-001.

## Schedule

GitHub Actions checks on the 28th through 31st at 23:17 and 23:47
Asia/Singapore time. The executor proceeds only on the actual last calendar
day. A completed monthly run is idempotent; the second attempt is a no-op.
GitHub runs scheduled workflows from the default branch, so this workflow
becomes active only after it is merged there.

## Review and eligibility

The read-only inventory is captured before each scheduled review. The eligibility
register contains exact candidate paths and evidence. Only regular files listed
there can be recommended or deleted. Unknown or stale evidence fails closed.

A candidate must have:
- `production_status` equal to `NON_PRODUCTION` and production evidence;
- a timezone-qualified creation timestamp and creation evidence proving it is
  more than 90 days old at run time;
- an identified owner;
- a current `NONE_FOUND` reference review with evidence;
- recovery value `NOT_REQUIRED` with evidence; and
- lifecycle status `OBSOLETE`.

Production artifacts, artifacts 90 days old or newer, secret-named paths,
symlinks, directories, protected repository control paths, and candidates
missing any required evidence are never recommended or deleted.

## Execution and evidence

The scheduled run writes its complete candidate decisions and deleted-path list
to `execution/workspace/REP-STEWARD-027/monthly-run-evidence.jsonl`. It deletes
only eligible registered regular files, then commits the run record and
deletions. Manual workflow runs are dry-run only. No existing broad cleanup
script is invoked.

An empty eligibility register yields zero cleanup recommendations and zero
deletions. Register entries require evidence-backed classification; filenames
and modification times alone are not evidence of production status or creation
age.
