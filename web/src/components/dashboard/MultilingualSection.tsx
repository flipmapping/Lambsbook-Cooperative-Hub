// MultilingualSection
//
// EDUCATIONAL RUNTIME — dashboard-native, additive-only.
// Multilingual exchange session participation surface.
// Member view: actionable participation summary and session entry.
// Non-member view: read-only visibility card — mirrors ProgramsSection gating pattern.
//
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  ARCHITECTURAL GUARDRAIL — DO NOT REMOVE                                   ║
// ║                                                                            ║
// ║  Multilingual pipeline items in mockData.ts represent cooperative          ║
// ║  participation IDEAS inside IdeaPipelineSection. They are pipeline items   ║
// ║  that happen to be about multilingual initiatives.                         ║
// ║                                                                            ║
// ║  MultilingualSection is the dedicated RUNTIME PARTICIPATION SURFACE for    ║
// ║  multilingual exchange sessions, language pairing, and progression.        ║
// ║                                                                            ║
// ║  These are two distinct surfaces serving two distinct purposes.            ║
// ║  They must never be merged, cross-referenced, or consolidated.             ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
//
// ISOLATION RULES:
// - No imports from @/components/activity/*
// - No imports from @/lib/contributions/*
// - No imports from @/components/dashboard/types
// - No imports from @/components/dashboard/mockData
// - No imports from ProgramsSection (gating pattern mirrored by convention, not shared code)
// - No InteractionCapability coupling
// - No entryState mutation
// - isMember boolean is the sole gating prop — already derived in DashboardPage

import type { MultilingualParticipationSummary } from "@/lib/learning/types";
import { MOCK_MULTILINGUAL_SUMMARY } from "@/lib/learning/mock-multilingual";

type MultilingualSectionProps = {
  isMember: boolean;
};

function MultilingualMemberView({
  summary,
}: {
  summary: MultilingualParticipationSummary;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Active sessions
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-100">
            {summary.activeSessionCount > 0
              ? `${summary.activeSessionCount} session${summary.activeSessionCount === 1 ? "" : "s"}`
              : "None active"}
          </p>
        </div>

        {summary.participationStreakLabel ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Participation streak
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {summary.participationStreakLabel}
            </p>
          </div>
        ) : null}

        {summary.nextSessionLabel ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Next session
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {summary.nextSessionLabel}
            </p>
          </div>
        ) : null}
      </div>

      {summary.languagePairs.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Active language pairs
          </p>
          <ul className="flex flex-wrap gap-2">
            {summary.languagePairs.map((pair) => (
              <li
                key={pair}
                className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
              >
                {pair}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-slate-500">
        Full multilingual session management and partner matching will be
        available here as the runtime is built out.
      </p>
    </div>
  );
}

function MultilingualNonMemberView() {
  return (
    <p className="mt-3 text-sm text-slate-400">
      Multilingual exchange sessions stay visible here so you can understand
      what is available. Full session participation becomes available in member
      view.
    </p>
  );
}

export function MultilingualSection({ isMember }: MultilingualSectionProps) {
  const summary: MultilingualParticipationSummary = MOCK_MULTILINGUAL_SUMMARY;

  return (
    <section
      id="multilingual"
      aria-labelledby="multilingual-heading"
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Educational Runtime
        </p>
        <h2
          id="multilingual-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Multilingual Exchange
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Language exchange sessions and multilingual participation integrated
          into the cooperative learning environment.
        </p>
      </div>

      {isMember ? (
        <MultilingualMemberView summary={summary} />
      ) : (
        <MultilingualNonMemberView />
      )}
    </section>
  );
}
