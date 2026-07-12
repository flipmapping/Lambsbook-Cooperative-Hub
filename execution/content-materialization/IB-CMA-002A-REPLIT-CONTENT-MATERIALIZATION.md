# Implementation Brief

Authority

CMA-002A

Execution Engine

Replit AI

Mission

Materialize the Founder-approved CTBC source corpus into repository-certified
runtime content for the Growth Engine recruitment funnel.

Authoritative Inputs

• execution/content-materialization/CMA-002A-REPLIT-AI-WORK-PACKAGE.md
• execution/content-materialization/CMA-002B-CONTENT-MATERIALIZATION-REPORT.md
• governance/content-authority/GE-RMP-002A-SOURCE-REGISTRY.md
• CTBC document/

Runtime Languages

1. Vietnamese (default)
2. English
3. Simplified Chinese

Repository Output Surface

web/src/growth/content/

Required JSON Files

en/
    programs.json
    scholarships.json
    admissions.json

vi/
    programs.json
    scholarships.json
    admissions.json

zh/
    programs.json
    scholarships.json
    admissions.json

Execution Rules

• Read only Founder-approved repository assets.
• Preserve factual meaning.
• Preserve the existing JSON schema.
• Preserve all existing translation keys.
• Preserve runtime contracts.
• Record unresolved source gaps.
• Never invent content.
• Do not modify application code.
• Do not modify Builder.
• Do not modify governance.
• Do not modify database objects.

Required Deliverables

1. Nine populated JSON files.
2. Updated Content Materialization Report.
3. Repository mutation summary.
4. List of unresolved source gaps (if any).

Completion Condition

Repository-certified multilingual runtime content is ready for Builder
v1.2 package generation.
