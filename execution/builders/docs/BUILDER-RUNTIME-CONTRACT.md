# Builder Runtime Contract

Status

CERTIFIED

Purpose

Define the canonical runtime contract for the Builder implementation.

This document is repository documentation and shall be treated as
Repository Truth once verified.

## Runtime Contract

Builder Entrypoint

execution/builders/build_claude_package.py

Working Directory

Repository root.

Execution Environment

Python environment capable of importing the top-level `execution`
package from the repository root.

Package Structure

The Builder executes within the repository package hierarchy.
Absolute imports such as:

    from execution.builders...

require execution from the repository root.

Launcher

To be certified from repository evidence.

Canonical Invocation

To be certified from repository evidence.

Qualification Evidence

To be recorded after the first successful Builder execution.

Correction Rule

If the canonical launcher or invocation differs from this document,
update this document from repository evidence before any Builder
implementation mutation.

STOP.
