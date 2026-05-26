import {
  StageActionLabel,
  StageMeaningLabel,
} from "@/components/dashboard/types";
import type {
  InteractionCapability,
  PipelineItem,
  PipelineStageKey,
} from "@/components/dashboard/types";

type IdeaPipelineSectionProps = {
  items: PipelineItem[];
  onItemSelect?: (item: PipelineItem) => void;
  capability: InteractionCapability;
  selectedItemId?: string | null;
};

const stageOrder: Array<{ key: PipelineStageKey; label: string }> = [
  { key: "idea", label: "Idea" },
  { key: "discussion", label: "Discussion" },
  { key: "candidate", label: "Candidate" },
  { key: "refinement", label: "Refinement" },
  { key: "support", label: "Support" },
  { key: "adoption", label: "Adoption" },
  { key: "formalized", label: "Formalized Program" },
];

export function IdeaPipelineSection({
  items,
  onItemSelect,
  capability,
  selectedItemId,
}: IdeaPipelineSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Idea Pipeline
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Primary cooperative workflow
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Ideas move forward through shared discussion, refinement, support, adoption,
          and formalized program status.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
        <p className="font-medium text-white">Interaction visibility</p>
        <p className="mt-1">{capability.explanation}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-7 md:grid-cols-2">
        {stageOrder.map((stage) => {
          const stageItems = items.filter((item) => item.stage === stage.key);

          return (
            <div
              key={stage.key}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {StageMeaningLabel[stage.key]}
              </p>
              <div className="mt-2 inline-flex rounded-full border border-indigo-700/60 bg-indigo-900/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-200">
                {StageActionLabel[stage.key]}
              </div>

              <div className="mt-3 space-y-3">
                {stageItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-xs leading-5 text-slate-500">
                    No items in this stage yet.
                  </div>
                ) : null}

                {stageItems.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => onItemSelect?.(item)}
                    className={`cursor-pointer rounded-lg border bg-slate-900 px-3 py-3 hover:border-indigo-600 ${
                      selectedItemId === item.id ? "border-indigo-500" : "border-slate-800"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-100">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.summary}</p>
                    <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                      <p>{item.authorLabel}</p>
                      <p>Support: {item.supportCount}</p>
                      <p>Discussion: {item.discussionCount}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
