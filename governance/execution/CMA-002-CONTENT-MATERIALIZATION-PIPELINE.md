# CMA-002

Status

APPROVED

Title

CTBC Content Materialization Pipeline

Mission

Materialize Founder-approved CTBC source assets into repository-certified
runtime content.

Input Corpus

CTBC document/

Output Surface

web/src/growth/content/en/
web/src/growth/content/vi/
web/src/growth/content/zh/

Execution Pipeline

Stage 1
    Read Founder-approved source corpus.

Stage 2
    Extract structured facts only.
    No inference.
    No invented content.

Stage 3
    Normalize extracted content into a canonical intermediate model.

Stage 4
    Generate multilingual runtime JSON while preserving the existing
    repository schema and translation keys.

Stage 5
    Validate JSON structure.

Stage 6
    Founder review.

Stage 7
    Repository certification.

Stage 8
    Builder package regeneration.

Constitutional Constraints

The Content Materialization Authority SHALL:

• transform content;
• preserve provenance;
• preserve traceability.

The Content Materialization Authority SHALL NOT:

• mutate application code;
• modify Builder;
• modify governance outside CMA;
• bypass Founder review.

Deliverables

• Canonical intermediate content model.
• Multilingual JSON registries.
• Content provenance report.
• Builder-ready repository content.

Success Criteria

All runtime JSON originates exclusively from the certified CTBC source corpus.
