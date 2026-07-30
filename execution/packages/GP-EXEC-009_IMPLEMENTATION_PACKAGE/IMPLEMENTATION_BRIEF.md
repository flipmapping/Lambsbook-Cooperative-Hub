# GP-EXEC-009 IMPLEMENTATION BRIEF

Execution Standard: EOS-053
Generated: 2026-07-25T14:13:59Z

---

# Mission

Implement the Communication Surface in one coordinated implementation.

The repository discovery phase is complete.
Implementation boundaries are certified.
Architectural invariants are frozen.

The objective is capability delivery, not incremental repository mutation.

---

# Authorized Mutation Surface

1.
client/src/components/notifications/ChannelSelector.tsx

2.
client/src/components/notifications/NotificationPreferencesPanel.tsx

3.
server/services/notifications.ts

4.
server/services/admissions.ts

5.
shared/schema.ts

No additional production files may be modified unless a dependency is
demonstrably required for successful compilation.

---

# Work Packages

## WP-1 Notification Model

Objective

Extend the runtime notification channel model to support the new channel.

Constraints

• Preserve existing behaviour.
• Preserve existing channel values.
• Maintain backward compatibility.

Acceptance

The runtime model supports the additional notification channel.

---

## WP-2 Preference UI

Objective

Expose the new channel through the notification preference interface.

Constraints

• Existing preference behaviour remains unchanged.
• Existing layouts remain stable.

Acceptance

The new channel is configurable through the existing preference UI.

---

## WP-3 Dispatch

Objective

Make notification dispatch channel-aware.

Constraints

• Existing email behaviour remains functional.
• Existing dispatch architecture remains the single authority.

Acceptance

Dispatch routes according to the selected notification channel.

---

## WP-4 Adapter Activation

Objective

Connect dispatch to the channel adapter.

Constraints

• Do not introduce a parallel messaging architecture.
• Preserve provider abstraction.

Acceptance

The adapter participates in the existing notification pipeline.

---

# Architectural Invariants

Maintain the existing notification architecture.

Do not duplicate dispatch.

Do not bypass provider abstractions.

Do not create parallel notification paths.

Preserve backward compatibility.

---

# Required Deliverables

Return:

1. Modified file list

2. Unified diff

3. Build output

4. Runtime validation

5. Remaining fractures

6. Any implementation assumptions

---

# Verification

Run one repository build.

Resolve compile failures introduced by the implementation.

Perform runtime validation.

Produce a final implementation report.

---

End of Implementation Brief.
