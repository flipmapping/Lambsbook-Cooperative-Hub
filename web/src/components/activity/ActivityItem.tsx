type ActivityItemProps = {
  title: string;
  summary: string;
  timestampLabel: string;
  typeLabel: string;
};

export function ActivityItem({
  title,
  summary,
  timestampLabel,
  typeLabel,
}: ActivityItemProps) {
  return (
    <li className="relative pl-6">
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-slate-400"
      />
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-100">{title}</p>
          <span className="text-xs text-slate-400">{timestampLabel}</span>
        </div>
        <p className="mb-2 text-sm text-slate-300">{summary}</p>
        <span className="inline-flex rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
          {typeLabel}
        </span>
      </div>
    </li>
  );
}
