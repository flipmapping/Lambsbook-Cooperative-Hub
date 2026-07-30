# NM-001 Operational Evidence Checklist

Collect the following artifacts:

- HTTP request used for the stage transition
- HTTP response payload
- Server log covering the request
- Notification persistence evidence
- Timestamp of execution
- Build/version identifier

Acceptance Criteria

- Stage transition succeeds.
- API response is unchanged.
- Exactly one notification publication occurs per request.
- Notification record is created (or graceful failure is recorded if delivery is unavailable).
- No unexpected runtime errors are observed.
