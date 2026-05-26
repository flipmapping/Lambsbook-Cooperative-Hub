import type { HeroFeedback } from "@/components/dashboard/types";

type DashboardHeroCurrentPositionProps = {
  title: string;
  description: string;
  stateLabel: string;
  feedback?: HeroFeedback | null;
};

export function DashboardHeroCurrentPosition({
  title,
  description,
  stateLabel,
  feedback,
}: DashboardHeroCurrentPositionProps) {
  return (
    <section className="rounded-2xl border border-indigo-800/60 bg-gradient-to-br from-indigo-950/60 to-slate-900 px-6 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
        Current Position
      </p>
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="rounded-xl border border-indigo-700/70 bg-indigo-900/30 px-4 py-3 text-sm text-indigo-100">
          State: <span className="font-semibold">{stateLabel}</span>
        </div>
      </div>

      {feedback ? (
        <div className="mt-5 rounded-xl border border-emerald-700/70 bg-emerald-900/20 px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-200">{feedback.title}</p>
              <p className="mt-1 text-sm text-emerald-100/90">{feedback.summary}</p>
            </div>
            <div className="shrink-0 rounded-full border border-emerald-600/70 bg-emerald-700/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
              {feedback.chipLabel}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
