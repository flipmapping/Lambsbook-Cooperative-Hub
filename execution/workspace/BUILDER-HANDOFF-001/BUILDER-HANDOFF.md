# BUILDER-HANDOFF-001

Created
-------

2026-07-30 04:16 UTC

Purpose
-------

Provide the Builder with a complete, immutable input set for
generating exactly one Production Implementation Context (PIC).

Execution Contract
------------------

Input:
- Builder Activation package
- Builder Invocation manifest

Output:
- One Production Implementation Context (PIC) ZIP

Constraints
-----------

- No repository mutation
- No implementation
- No architecture redesign
- EOS-CRSG-001 compliance required

Completion
----------

The Builder shall emit exactly one PIC package suitable for direct
implementation.
