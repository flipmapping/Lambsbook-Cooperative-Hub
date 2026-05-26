import { useState } from "react";
import type { Contribution } from "@/types/contribution";
import PipelineStageBadge from "@/components/contributions/PipelineStageBadge";

type ContributionCardProps = {
  contribution: Contribution;
};

export default function ContributionCard({ contribution }: ContributionCardProps) {
  const [hasLocallySeconded, setHasLocallySeconded] = useState(false);
  const [hasLocallyInitiated, setHasLocallyInitiated] = useState(false);
  const [hasLocallyClarified, setHasLocallyClarified] = useState(false);
  const [hasLocallyAcknowledged, setHasLocallyAcknowledged] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="font-medium text-slate-900">{contribution.title}</div>
      <div className="text-sm text-slate-600">{contribution.description}</div>

      <PipelineStageBadge
        interactionState={contribution.interactionState}
        pipelineStage={contribution.pipelineStage}
      />

      <div className="mt-2 text-xs text-slate-500 space-y-1">
        {contribution.interactionState === "uninitiated" && (
          <div>Not yet shared</div>
        )}
        {contribution.interactionState === "initiated" && (
          <div>Shared for consideration</div>
        )}
        {hasLocallyInitiated && (
          <div className="text-xs text-slate-400">Your sharing is recorded locally for consideration in this view only.</div>
        )}
        {contribution.seconders && contribution.seconders.length > 0 && (
          <div>
            Recognized by {contribution.seconders.length} {contribution.seconders.length === 1 ? "member" : "members"}
          </div>
        )}
        {hasLocallySeconded && (
          <div className="text-xs text-slate-400">Your recognition is recorded locally for this view only.</div>
        )}
        {hasLocallyClarified && (
          <div className="text-xs text-slate-400">Local clarification for this view only.</div>
        )}
        {hasLocallyAcknowledged && (
          <div className="text-xs text-slate-300">Seen in this view only.</div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallySeconded((value) => !value)}
        >
          {hasLocallySeconded ? "Withdraw local recognition" : "Recognize locally"}
        </button>
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallyInitiated((value) => !value)}
        >
          {hasLocallyInitiated ? "Withdraw local sharing" : "Share locally for consideration"}
        </button>
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallyClarified((value) => !value)}
        >
          {hasLocallyClarified ? "Hide local clarification" : "Show local clarification"}
        </button>
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500"
          onClick={() => setHasLocallyAcknowledged((value) => !value)}
        >
          {hasLocallyAcknowledged ? "Unmark local acknowledgment" : "Mark as seen locally"}
        </button>
      </div>

    </div>
  );
}
