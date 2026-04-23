const fs = require('fs');

const target = 'web/src/components/contributions/ContributionCard.tsx';
const original = fs.readFileSync(target, 'utf8');

const expected = `import type { Contribution } from "@/types/contribution";
import PipelineStageBadge from "@/components/contributions/PipelineStageBadge";

type ContributionCardProps = {
  contribution: Contribution;
};

export default function ContributionCard({ contribution }: ContributionCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="font-medium text-slate-900">{contribution.title}</div>
      <div className="text-sm text-slate-600">{contribution.description}</div>

      <PipelineStageBadge pipelineStage={contribution.pipelineStage} />
    </div>
  );
}
`;

const replacement = `import type { Contribution } from "@/types/contribution";
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
`;

if (original !== expected) {
  console.log('STOP: live file does not match expected preflight text');
  process.exit(1);
}

fs.writeFileSync(target, replacement);
console.log('MUTATION_APPLIED');
