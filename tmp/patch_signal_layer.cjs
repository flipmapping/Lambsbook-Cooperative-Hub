const fs = require('fs');

const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

// Ensure exact anchor exists
const anchor = `<PipelineStageBadge
        interactionState={contribution.interactionState}
        pipelineStage={contribution.pipelineStage}
      />`;

if (!s.includes(anchor)) {
  console.log('STOP: expected PipelineStageBadge anchor not found');
  process.exit(1);
}

// Signal block (read-only, non-interactive)
const signalBlock = `
      <div className="mt-2 text-xs text-slate-500 space-y-1">
        {contribution.interactionState === "uninitiated" && (
          <div>Not yet shared</div>
        )}
        {contribution.interactionState === "initiated" && (
          <div>Shared for consideration</div>
        )}
        {contribution.seconders && contribution.seconders.length > 0 && (
          <div>
            Recognized by {contribution.seconders.length} {contribution.seconders.length === 1 ? "member" : "members"}
          </div>
        )}
      </div>
`;

s = s.replace(anchor, `${anchor}\n${signalBlock}`);

if (s === original) {
  console.log('STOP: no mutation applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
