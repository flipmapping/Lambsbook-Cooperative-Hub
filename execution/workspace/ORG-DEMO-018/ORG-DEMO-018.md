# ORG-DEMO-018

Builder Manifest

Authority
---------

ORG-DEMO-017
EOS-CRSG-001
EOS-SYNC-REP-001A

Execution Mode
--------------

Platform Generalization

Mission
-------

Externalize the founder demonstration into a Builder Manifest so the
Demo Launcher executes organizations from configuration rather than
embedded code.

Repository
----------

client/src/organization/

    demo/
        BuilderManifest.ts
        BuilderManifestLoader.ts
        DemoOrchestrator.ts
        FounderDemoLauncher.tsx
        manifests/
            cooperative-hub.ts
            university.ts
            nonprofit.ts

Builder Flow
------------

Founder
    ↓
Select Builder Manifest
    ↓
Load Manifest
    ↓
Generate Builder Plan
    ↓
Execute Builder Session
    ↓
Materialize Builder Workspace
    ↓
Repository Stewardship Evidence
    ↓
Demo Completion

Builder Manifest
----------------

Each manifest defines:

- Organization profile
- Mission
- Programs / SBUs
- Enabled capabilities
- Demo conversation
- Expected Builder Plan
- Initial Builder Workspace
- Demonstration metadata

Platform Objectives
-------------------

- Execute multiple organizations without code changes.
- Preserve Builder Session contracts.
- Preserve Repository Stewardship integration.
- Demonstrate configuration-driven Builder-as-a-Service.

Acceptance Criteria
-------------------

- Demo Launcher consumes Builder Manifest.
- Multiple manifests execute successfully.
- Builder Plan derives from the selected manifest.
- Repository Stewardship evidence remains visible.
- Founder experiences a reusable Builder platform.