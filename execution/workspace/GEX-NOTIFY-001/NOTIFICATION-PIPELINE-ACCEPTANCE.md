# Runtime Acceptance Criteria

Given:
- A valid AdmissionsStageTransitionEvent

When:
- The NotificationPipeline executes

Then:
- Exactly one CommunicationIntent is created.
- Exactly one NotificationIntent is persisted.
- The persisted NotificationIntent has status 'pending'.
- No provider adapter is invoked during this stage.

This completes the executable business pipeline while preserving
provider independence.
