const fs = require('fs');
const target = 'web/src/types/contribution-state.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const block = `export function getElevationReadiness(contribution: Contribution): ElevationReadiness {
  const hasInitiator = Boolean(contribution.initiator?.memberId);
  const seconderCount = contribution.seconders.length;
  const meetsMinimumSeconders = seconderCount >= 2;

  return {
    hasInitiator,
    seconderCount,
    meetsMinimumSeconders,
    canEnterPipeline: hasInitiator && meetsMinimumSeconders,
  };
}

`;

if (!s.includes(block)) {
  console.log('STOP: exact getElevationReadiness block not found');
  process.exit(1);
}

s = s.replace(block, '');

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
