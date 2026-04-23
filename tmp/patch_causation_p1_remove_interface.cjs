const fs = require('fs');
const target = 'web/src/types/contribution-state.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const block = `export interface ElevationReadiness {
  hasInitiator: boolean;
  seconderCount: number;
  meetsMinimumSeconders: boolean;
  canEnterPipeline: boolean;
}

`;

if (!s.includes(block)) {
  console.log('STOP: exact ElevationReadiness block not found');
  process.exit(1);
}

s = s.replace(block, '');

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
