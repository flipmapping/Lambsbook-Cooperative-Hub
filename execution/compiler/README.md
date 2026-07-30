# Execution Compiler SDK

This package defines the stable runtime interfaces used by all
Execution Compiler components.

Implementation begins with the Context Resolver.


Execution Event Contract
------------------------

Every compiler stage emits immutable ExecutionEvent objects.

Administrative artifacts (checkpoint, summary,
dashboard, handoff, publication) are derived
from execution events by EOS rather than
being authored by compiler components.
