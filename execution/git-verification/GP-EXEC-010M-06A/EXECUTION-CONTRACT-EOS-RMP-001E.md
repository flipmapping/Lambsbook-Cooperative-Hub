# EOS-RMP-001E Execution Contract

Status

MANDATORY

--------------------------------------------------

Repository Mutation Corridor

MODIFY

execution/builders/build_claude_package.py

--------------------------------------------------

Authorized Mutation Scope

1. Extend MANDATORY_FIELDS with:

Implementation Context Manifest

2. Extend PACKAGE_SUBDIRS with:

implementation-context

3. Extend locate_artifacts() to resolve the explicit
Implementation Context Manifest path from the CIB.

4. Extend _assemble_artifacts() to:

- read the ICM;
- parse the Implementation Context section;
- verify each listed repository-relative file exists;
- copy each listed file into implementation-context/;
- preserve repository-relative paths;
- append copied files to the existing assembled list.

--------------------------------------------------

Prohibited Mutations

DO NOT modify:

- START-HERE generation
- PACKAGE-MANIFEST generation
- Package verification
- ZIP generation
- SHA256 generation
- Repository Truth validation
- Authority consistency validation
- Command-line interface

--------------------------------------------------

Acceptance Criteria

PASS when:

- Existing Builder v1.0 behaviour remains unchanged.
- Builder consumes the explicit ICM.
- Generated Claude Package contains implementation-context/.
- PACKAGE-MANIFEST.md includes copied implementation-context files.
- ZIP and SHA256 generation continue unchanged.
