import type { Contribution } from "@/types/contribution";
import PipelineStageBadge from "@/components/contributions/PipelineStageBadge";

type ContributionCardProps = {
  contribution: Contribution;
};

export default function ContributionCard({ contribution }: ContributionCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="font-medium text-slate-900">{contribution.title}</div>
      <div className="text-sm text-slate-600">{contribution.description}</div>

      <PipelineStageBadge
        interactionState={contribution.interactionState}
        pipelineStage={contribution.pipelineStage}
      />
    </div>
  );
}
