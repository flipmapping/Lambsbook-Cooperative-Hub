type ContributionCard = {
  label: string;
  value: number;
  helper: string;
};

type MyContributionsSectionProps = {
  cards: ContributionCard[];
};

export function MyContributionsSection({
  cards,
}: MyContributionsSectionProps) {
  const allZero = cards.every((card) => card.value === 0);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          My Contributions
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Participation across the workflow
        </h2>
      </div>

      {allZero ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          No local contributions yet. Actions taken in this dashboard will appear here immediately.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{card.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
