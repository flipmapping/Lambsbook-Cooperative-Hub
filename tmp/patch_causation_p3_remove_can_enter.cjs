const fs = require('fs');
const target = 'web/src/types/contribution-state.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const block = `export function canEnterExpressed(contribution: Contribution): boolean {
  if (contribution.pipelineStage) return false;
  const readiness = getElevationReadiness(contribution);
  return readiness.canEnterPipeline;
}

`;

if (!s.includes(block)) {
  console.log('STOP: exact canEnterExpressed block not found');
  process.exit(1);
}

s = s.replace(block, '');

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
