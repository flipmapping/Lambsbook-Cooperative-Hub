type PipelineStageBadgeProps = {
  interactionState: string;
  pipelineStage?: string;
};

function getInteractionStateLabel(interactionState: string): string {
  switch (interactionState) {
    case "uninitiated":
      return "Not yet shared";
    case "initiated":
      return "Shared for consideration";
    case "expressed":
      return "Now in progression";
    case "acknowledged":
      return "Recognized in progression";
    case "engaged":
      return "Actively in development";
    case "materialized":
      return "Brought into realized form";
    case "archived":
      return "No longer in active progression";
    default:
      return "Not yet shared";
  }
}

export default function PipelineStageBadge({ interactionState }: PipelineStageBadgeProps) {
  return (
    <div className="mt-2 text-xs text-slate-500">
      {getInteractionStateLabel(interactionState)}
    </div>
  );
}
