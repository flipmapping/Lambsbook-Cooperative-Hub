import { MOCK_CONTRIBUTIONS } from "@/lib/contributions/mock-data";

export default function ContributionActivity() {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold">Contribution Activity</h2>

      <div className="space-y-3">
        {MOCK_CONTRIBUTIONS.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="font-medium text-slate-900">{c.title}</div>
            <div className="text-sm text-slate-600">{c.description}</div>

            <div className="mt-2 text-xs text-slate-500">
              {c.pipelineStage ? c.pipelineStage : "Not yet in pipeline"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
