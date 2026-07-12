# Discovery

Status

CERTIFIED

Title

Contract Semantic Migration Gap

Repository Truth

Repository inspection confirms an incomplete semantic migration.

Canonical service contracts currently expose:

- notes
- due_date

A subset of DAL and UI components has migrated to:

- description
- due_at

No implementation authority exists governing this semantic migration.

Conclusion

Exactly one bounded Repository Mutation Authority is required to reconcile the repository to a single canonical contract before further implementation proceeds.
