// Learning runtime types.
// ISOLATED NAMESPACE — do not import from @/components/dashboard/types.
// These types are owned exclusively by the educational runtime sections.

export type LearningHistoryEventType =
  | "program"
  | "ielts"
  | "multilingual"
  | "milestone";

export type LearningHistoryEntry = {
  id: string;
  eventType: LearningHistoryEventType;
  title: string;
  summary: string;
  timestampLabel: string;
};

export type IELTSEnrollmentStatus =
  | "not_enrolled"
  | "enrolled"
  | "in_progress"
  | "completed";

export type IELTSEnrollmentSummary = {
  enrollmentStatus: IELTSEnrollmentStatus;
  lastAttemptLabel: string | null;
  scoreLabel: string | null;
  nextSessionLabel: string | null;
};

export type MultilingualParticipationSummary = {
  activeSessionCount: number;
  languagePairs: string[];
  participationStreakLabel: string | null;
  nextSessionLabel: string | null;
};
