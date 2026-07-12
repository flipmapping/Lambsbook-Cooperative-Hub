# EOS-CMA-001

Status

APPROVED

Title

Content Materialization Principle

Purpose

Define the constitutional boundary for transforming Founder-approved
immutable source artifacts into repository-certified runtime content.

Principle

Founder-approved source artifacts SHALL be transformed into
repository-certified runtime content by the Content Materialization
Authority (CMA) before Builder package generation.

Builder SHALL package certified content.

Builder SHALL NOT transform business content.

Claude SHALL consume packaged content.

Claude SHALL NOT derive runtime content directly from immutable
Founder-approved source artifacts.

Responsibilities

Content Materialization Authority
    • Content transformation
    • Localization
    • Registry generation
    • Asset certification

Builder
    • Repository Truth
    • Package generation
    • Package integrity
    • Claude readiness

Claude
    • Repository mutation
    • Runtime implementation

Single Responsibility

Each subsystem SHALL have exactly one constitutional reason to change.
