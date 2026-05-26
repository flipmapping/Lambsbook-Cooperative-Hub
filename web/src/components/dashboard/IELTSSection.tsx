// IELTSSection
//
// EDUCATIONAL RUNTIME — dashboard-native, additive-only.
// IELTS enrollment status and entry surface.
// Member view: actionable entry with enrollment summary.
// Non-member view: read-only visibility card — mirrors ProgramsSection gating pattern.
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

import type { IELTSEnrollmentSummary, IELTSEnrollmentStatus } from "@/lib/learning/types";
import { MOCK_IELTS_SUMMARY } from "@/lib/learning/mock-ielts";

type IELTSSectionProps = {
  isMember: boolean;
};

function enrollmentStatusLabel(status: IELTSEnrollmentStatus): string {
  switch (status) {
    case "not_enrolled":
      return "Not enrolled";
    case "enrolled":
      return "Enrolled";
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
  }
}

function IELTSMemberView({ summary }: { summary: IELTSEnrollmentSummary }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Status
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-100">
            {enrollmentStatusLabel(summary.enrollmentStatus)}
          </p>
        </div>

        {summary.scoreLabel ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Score estimate
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {summary.scoreLabel}
            </p>
          </div>
        ) : null}

        {summary.lastAttemptLabel ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last session
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {summary.lastAttemptLabel}
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

      <p className="text-xs text-slate-500">
        Full IELTS practice and assessment tools will be available here as the
        runtime is built out.
      </p>
    </div>
  );
}

function IELTSNonMemberView() {
  return (
    <p className="mt-3 text-sm text-slate-400">
      IELTS preparation and practice stays visible here so you can understand
      what is available. Full IELTS session access becomes available in member
      view.
    </p>
  );
}

export function IELTSSection({ isMember }: IELTSSectionProps) {
  const summary: IELTSEnrollmentSummary = MOCK_IELTS_SUMMARY;

  return (
    <section
      id="ielts"
      aria-labelledby="ielts-heading"
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Educational Runtime
        </p>
        <h2
          id="ielts-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          IELTS Preparation
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Structured IELTS practice and assessment integrated into the
          cooperative learning environment.
        </p>
      </div>

      {isMember ? (
        <IELTSMemberView summary={summary} />
      ) : (
        <IELTSNonMemberView />
      )}
    </section>
  );
}
