// Multilingual participation mock data.
// ISOLATED NAMESPACE — owned exclusively by MultilingualSection.
//
// ARCHITECTURAL GUARDRAIL (data layer):
// Multilingual pipeline items that appear in mockData.ts represent cooperative
// participation ideas inside IdeaPipelineSection. They are pipeline items.
// This mock data represents the multilingual runtime participation surface —
// exchange sessions, language pairing, and progression. These are distinct
// data domains and must never be merged or cross-referenced.

import type { MultilingualParticipationSummary } from "./types";

export const MOCK_MULTILINGUAL_SUMMARY: MultilingualParticipationSummary = {
  activeSessionCount: 2,
  languagePairs: ["English — Vietnamese", "English — Mandarin"],
  participationStreakLabel: "3 consecutive weeks",
  nextSessionLabel: "Tomorrow at 6:00 PM",
};

// Null variant for empty-state development and testing.
export const MOCK_MULTILINGUAL_SUMMARY_EMPTY: MultilingualParticipationSummary =
  {
    activeSessionCount: 0,
    languagePairs: [],
    participationStreakLabel: null,
    nextSessionLabel: null,
  };
