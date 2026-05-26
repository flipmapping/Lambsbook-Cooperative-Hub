// IELTS enrollment mock data.
// ISOLATED NAMESPACE — owned exclusively by IELTSSection.
// Must not reference pipeline item IDs, contribution data, or cooperative activity.

import type { IELTSEnrollmentSummary } from "./types";

export const MOCK_IELTS_SUMMARY: IELTSEnrollmentSummary = {
  enrollmentStatus: "in_progress",
  lastAttemptLabel: "5 days ago",
  scoreLabel: "Band 6.5 (estimated)",
  nextSessionLabel: "Available now",
};

// Null variant for empty-state development and testing.
export const MOCK_IELTS_SUMMARY_EMPTY: IELTSEnrollmentSummary = {
  enrollmentStatus: "not_enrolled",
  lastAttemptLabel: null,
  scoreLabel: null,
  nextSessionLabel: null,
};
