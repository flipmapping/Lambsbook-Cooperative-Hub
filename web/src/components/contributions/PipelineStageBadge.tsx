type PipelineStageBadgeProps = {
  pipelineStage?: string;
};

export default function PipelineStageBadge({ pipelineStage }: PipelineStageBadgeProps) {
  return (
    <div className="mt-2 text-xs text-slate-500">
      {pipelineStage ? pipelineStage : "Awaiting cooperative support to enter progression"}
    </div>
  );
}
