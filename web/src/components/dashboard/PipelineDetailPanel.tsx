import {
  StageActionLabel,
  StageMeaningLabel,
} from "@/components/dashboard/types";
import type { InteractionCapability, LocalFeedback, PipelineItem } from "@/components/dashboard/types";

type PipelineDetailPanelProps = {
  item: PipelineItem | null;
  onClose: () => void;
  onJoinDiscussion?: (itemId: string) => void;
  onToggleSupport?: (itemId: string) => void;
  onToggleAdoption?: (itemId: string) => void;
  hasJoinedDiscussion?: boolean;
  hasSupported?: boolean;
  hasConsideredAdoption?: boolean;
  capability: InteractionCapability;
  latestFeedback?: LocalFeedback | null;
};

export function PipelineDetailPanel({
  item,
  onClose,
  onJoinDiscussion,
  onToggleSupport,
  onToggleAdoption,
  hasJoinedDiscussion = false,
  hasSupported = false,
  hasConsideredAdoption = false,
  capability,
  latestFeedback,
}: PipelineDetailPanelProps) {
  if (!item) return null;

  const showDiscussionAction = item.stage === "idea" || item.stage === "discussion";
  const showSupportAction = item.stage === "support";
  const showAdoptionAction = item.stage === "adoption";

  const discussionDisabled = !capability.canJoinDiscussion;
  const supportDisabled = !capability.canShowSupport;
  const adoptionDisabled = !capability.canConsiderAdoption;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-md overflow-y-auto border-l border-slate-800 bg-slate-900 p-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
        >
          Close
        </button>

        <h2 className="mt-4 text-xl font-semibold text-white">{item.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>

        <div className="mt-5 space-y-2 text-sm text-slate-400">
          <p>Stage: {item.stage}</p>
          <p>{StageMeaningLabel[item.stage]}</p>
          <p>{item.authorLabel}</p>
          <p>Support: {item.supportCount}</p>
          <p>Discussion: {item.discussionCount}</p>
        </div>

        <div className="mt-6 rounded-lg border border-indigo-700 bg-indigo-700/10 px-4 py-3 text-sm text-indigo-200">
          {StageActionLabel[item.stage]}
        </div>

        {latestFeedback ? (
          <div className="mt-4 rounded-lg border border-emerald-700/60 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-200">
            {latestFeedback.message}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {showDiscussionAction ? (
            <>
              <button
                type="button"
                disabled={discussionDisabled}
                onClick={() => onJoinDiscussion?.(item.id)}
                className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hasJoinedDiscussion ? "Leave discussion" : "Join discussion"}
              </button>
              {discussionDisabled ? (
                <p className="text-xs text-slate-500">{capability.explanation}</p>
              ) : null}
            </>
          ) : null}

          {showSupportAction ? (
            <>
              <button
                type="button"
                disabled={supportDisabled}
                onClick={() => onToggleSupport?.(item.id)}
                className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hasSupported ? "Remove support" : "Show support"}
              </button>
              {supportDisabled ? (
                <p className="text-xs text-slate-500">{capability.explanation}</p>
              ) : null}
            </>
          ) : null}

          {showAdoptionAction ? (
            <>
              <button
                type="button"
                disabled={adoptionDisabled}
                onClick={() => onToggleAdoption?.(item.id)}
                className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hasConsideredAdoption ? "Undo adoption consideration" : "Consider adoption"}
              </button>
              {adoptionDisabled ? (
                <p className="text-xs text-slate-500">{capability.explanation}</p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
