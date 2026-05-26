import type { CooperativeActivityItem } from "@/components/dashboard/types";

type CooperativeActivitySectionProps = {
  items: CooperativeActivityItem[];
};

export function CooperativeActivitySection({
  items,
}: CooperativeActivitySectionProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Cooperative Activity
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Shared movement across the cooperative
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          No local activity yet. New local actions will appear here immediately.
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-300">{item.summary}</p>
              </div>
              <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                {item.timestampLabel}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
