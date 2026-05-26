# Textual Certainty Gate

## Purpose

This doctrine governs all future shell-based mutation and SQL generation for the Lambsbook project.

## Core Rule

Before any mutation:
1. inspect exact live text first
2. confirm wrapper context
3. confirm indentation and line breaks
4. choose the smallest stable anchor
5. mutate one bounded target only
6. verify immediately

## Forbidden

- patching from logical block assumptions alone
- batching multiple branch mutations before exact probe
- broad exact-match replacement without live boundary proof
- treating shell mutation like AST transformation

## Principle

Textual certainty first.
Logical correctness second.

## Operational Interpretation

Shell mutation edits text under constraints.
It does not safely infer logical structure unless that structure has already been proven textually in the live file.

## Standard Sequence

1. inspect
2. probe
3. patch one target
4. verify
5. continue only if verified

## Applicability

This rule applies to:
- Master chat shell prompts
- Onboarding chat shell prompts
- Strategic oversight for mutation approval
- SQL generation when exact live DB object text or inspected schema shape matters

