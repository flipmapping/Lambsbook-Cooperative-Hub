// LearningHistorySection
//
// EDUCATIONAL RUNTIME — dashboard-native, additive-only.
// Read-only display of educational progression history.
// Visible to all authenticated users regardless of membership state.
// NOT member-gated — authenticated non-members may have learning history.
//
// ISOLATION RULES:
// - No imports from @/components/activity/*
// - No imports from @/lib/contributions/*
// - No imports from @/components/dashboard/types
// - No imports from @/components/dashboard/mockData
// - No InteractionCapability coupling
// - No entryState mutation

import type { LearningHistoryEntry, LearningHistoryEventType } from "@/lib/learning/types";
import { MOCK_LEARNING_HISTORY } from "@/lib/learning/mock-history";

function eventTypeLabel(eventType: LearningHistoryEventType): string {
  switch (eventType) {
    case "program":
      return "Program";
    case "ielts":
      return "IELTS";
    case "multilingual":
      return "Multilingual";
    case "milestone":
      return "Milestone";
  }
}

function LearningHistoryItem({ entry }: { entry: LearningHistoryEntry }) {
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
        <span className="mt-1 w-px flex-1 bg-slate-800" />
      </div>
      <div className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-900/60 px-2 py-0.5 text-xs font-medium text-indigo-300">
            {eventTypeLabel(entry.eventType)}
          </span>
          <span className="text-xs text-slate-500">{entry.timestampLabel}</span>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-200">{entry.title}</p>
        <p className="mt-0.5 text-sm text-slate-400">{entry.summary}</p>
      </div>
    </li>
  );
}

export function LearningHistorySection() {
  const entries: LearningHistoryEntry[] = MOCK_LEARNING_HISTORY;

  return (
    <section
      id="learning-history"
      aria-labelledby="learning-history-heading"
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Educational Runtime
        </p>
        <h2
          id="learning-history-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Learning History
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          A read-only record of your educational progression across programs,
          IELTS practice, and multilingual sessions.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">
          No learning history recorded yet. Your educational activity will
          appear here as you participate in programs, IELTS sessions, and
          multilingual exchanges.
        </p>
      ) : (
        <ol className="space-y-0">
          {entries.map((entry) => (
            <LearningHistoryItem key={entry.id} entry={entry} />
          ))}
        </ol>
      )}
    </section>
  );
}
