---
name: Admin restoration boundaries
description: User-defined limits on restoring admin tabs without repeating data recovery
---

Restore missing admin tabs with bounded component/API/storage/schema ports, not whole-commit reversions. Preserve the current dashboard and unrelated backend behavior. Do not introduce bulk-delete controls for Prospects.

Existing development template records and fields are authoritative, including nulls, empty strings, whitespace, and multilingual content. Do not reseed, replace, normalize, or clear fields as part of UI restoration.

**Why:** The user said production templates had already been restored from the eight-row development export and explicitly prohibited further database changes for dashboard recovery.

**How to apply:** Use read-only data checks and synthetic fixtures for mutation tests. Exclude `.private-recovery/` from version control and publishing. Report exact changed paths and release/build results before publishing; a failed release gate blocks publishing rather than authorizing changes to release policy.
