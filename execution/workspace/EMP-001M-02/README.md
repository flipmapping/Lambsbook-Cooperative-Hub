# EMP-001M-02

Canonical Execution Model

Purpose
-------
Define the single data model shared by all Execution Compiler stages.

Implementation Rule
-------------------
Every compiler stage accepts the Canonical Execution Model,
adds information relevant to its responsibility,
and returns the same model.

No stage creates its own execution representation.
