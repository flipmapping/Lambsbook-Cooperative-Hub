// Learning history mock data.
// ISOLATED NAMESPACE — owned exclusively by LearningHistorySection.
// Must not reference contribution, pipeline, or cooperative activity data.

import type { LearningHistoryEntry } from "./types";

export const MOCK_LEARNING_HISTORY: LearningHistoryEntry[] = [
  {
    id: "lh-1",
    eventType: "ielts",
    title: "IELTS Practice Session Completed",
    summary:
      "Completed a full reading and writing practice session. Score estimate recorded for review.",
    timestampLabel: "2 days ago",
  },
  {
    id: "lh-2",
    eventType: "multilingual",
    title: "Multilingual Exchange Session Attended",
    summary:
      "Participated in a structured language exchange session. Exchange partner matched from the cooperative network.",
    timestampLabel: "5 days ago",
  },
  {
    id: "lh-3",
    eventType: "program",
    title: "English Communication Program — Module 2 Completed",
    summary:
      "Completed module 2 of the cooperative English communication program. Progress recorded.",
    timestampLabel: "1 week ago",
  },
  {
    id: "lh-4",
    eventType: "milestone",
    title: "Learning Milestone: 10 Sessions Completed",
    summary:
      "Reached 10 cumulative educational sessions across programs, IELTS practice, and multilingual exchanges.",
    timestampLabel: "2 weeks ago",
  },
  {
    id: "lh-5",
    eventType: "program",
    title: "English Communication Program — Module 1 Completed",
    summary:
      "Completed the introductory module of the cooperative English communication program.",
    timestampLabel: "3 weeks ago",
  },
];
