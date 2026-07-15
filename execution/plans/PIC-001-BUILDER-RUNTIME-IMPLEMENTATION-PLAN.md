# Builder Runtime Implementation Plan

Execution Order

Certified Builder Input Set
        ↓
Authority Resolution
        ↓
Package Assembly
        ↓
Inject Standard CLAUDE.md
        ↓
Generate IMPLEMENT.md
        ↓
Generate PACKAGE-MANIFEST.md
        ↓
Package Integrity
        ↓
Publish Certified PIC

Implementation Constraints

Builder SHALL NOT infer authority.

Builder SHALL NOT consume conversational context.

Builder SHALL package certified inputs only.
