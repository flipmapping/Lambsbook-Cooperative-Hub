type DashboardTopBarProps = {
  onOpenSubmitIdea?: () => void;
};

export function DashboardTopBar({ onOpenSubmitIdea }: DashboardTopBarProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Lambsbook Cooperative Hub
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Dashboard</h1>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <p className="max-w-2xl text-sm text-slate-300">
            The dashboard follows one cooperative workflow: ideas mature through discussion,
            refinement, support, adoption, and formalized programs.
          </p>
          <button
            type="button"
            onClick={onOpenSubmitIdea}
            className="rounded-lg border border-indigo-600 bg-indigo-600/10 px-4 py-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-600/20"
          >
            Submit Idea
          </button>
        </div>
      </div>
    </div>
  );
}
