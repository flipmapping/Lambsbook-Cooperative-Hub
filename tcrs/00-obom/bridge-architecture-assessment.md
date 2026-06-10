# OPEN BRAIN SOURCE

Remote Open Brain

Verified Entry Assets:

- brain:search
- brain:capture
- /functions/v1/search-entries
- /functions/v1/capture-entry
- erdikdmxukjyjnfurffn.supabase.co

OPEN_BRAIN_SOURCE=DEFINED

# BRIDGE ENTRY POINT

Primary Retrieval Entry:

- npm run brain:search

Primary Capture Entry:

- npm run brain:capture

Implementation Ownership Surfaces:

- scripts/brain-search.ts
- scripts/brain-capture.ts
- src/lib/openBrain.ts

MAIN_APP_BRIDGE=DEFINED

# LOCAL TRUTH STORES

OBOM Constitutional Artifacts:

- tcrs/00-obom/retrieval-order.md
- tcrs/00-obom/index-map.md
- tcrs/00-obom/synchronization-map.md
- tcrs/00-obom/remote-target-map.md
- tcrs/00-obom/truth-registry.md

Operational Synchronization Surface:

- tcrs/open-brain-sync/

Domain Truth Stores:

- tcrs/03-contracts
- tcrs/04-workflows
- tcrs/05-governance
- tcrs/06-discoveries
- tcrs/09-mvp-realization

# TRUTH APPLICATION LAYER

Classification Layer:

Remote Truth
→ Retrieved via brain:search
→ Classified
→ Mapped to local truth category

Mapping Layer:

Remote Truth
→ Contract
→ Workflow
→ Governance
→ Discovery
→ MVP Realization

TRUTH_APPLICATION_LAYER=DEFINED

# IMPLEMENTATION TARGETS

Truth Consumers:

- MVP realization artifacts
- workflow artifacts
- contract artifacts
- dashboard implementation inputs
- onboarding implementation inputs
- invitation implementation inputs

IMPLEMENTATION_TARGETS=DEFINED

# MVP SURFACE TARGETS

Expected Consumers:

- Dashboard
- Onboarding
- Invitation Flow
- Membership Materialization
- Cooperative Relationship Workflows
- Runtime Authority Surfaces

# RECOMMENDED CANONICAL FLOW

Remote Truth
→ brain:search
→ Bridge Entry
→ Classification
→ OBOM/TCRS Artifact
→ Implementation Target
→ MVP Surface

Authoritative Artifacts:

Constitutional Navigation:
- OBOM

Domain Truth Storage:
- TCRS

Recommended Authority Model:
- Both

OBOM:
- navigation
- ownership
- retrieval
- synchronization

TCRS:
- truth content
- contracts
- workflows
- discoveries
- realization records

CANONICAL_FLOW=DEFINED
