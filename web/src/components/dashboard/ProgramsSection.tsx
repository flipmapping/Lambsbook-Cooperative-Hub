import type { FormalizedProgram } from "@/components/dashboard/types";

type ProgramsSectionProps = {
  programs: FormalizedProgram[];
};

export function ProgramsSection({ programs }: ProgramsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Programs
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Formalized programs are secondary to the idea pipeline
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Credits appear only in program and subscription context, never in the idea pipeline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {programs.length === 0 && (
        <div className="text-sm text-slate-400">No programs available yet.</div>
      )}
      {programs.map((program) => (
          <article
            key={program.id}
            className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4"
          >
            <p className="text-sm font-semibold text-white">{program.name}</p>
            <p className="mt-1 text-sm text-slate-300">{program.summary}</p>
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <p>{program.statusLabel}</p>
              {program.subscriptionContextLabel ? (
                <p>{program.subscriptionContextLabel}</p>
              ) : null}
              {program.creditContextLabel ? <p>{program.creditContextLabel}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
