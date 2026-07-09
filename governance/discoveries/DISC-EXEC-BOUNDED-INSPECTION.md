# Discovery

Status

CERTIFIED

Title

Bounded Inspection Rule

Repository Truth

Large terminal inspections may interfere with execution visibility
without mutating repository state.

Execution Rule

Repository inspection SHALL:

- inspect only the certified mutation corridor;
- prefer head/tail/grep over full file output;
- inspect only files required for the active implementation authority.

Impact

Reduced execution noise.

Lower operational risk.

Faster repository truth acquisition.

