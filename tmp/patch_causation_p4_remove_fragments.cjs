const fs = require('fs');
const target = 'web/src/types/contribution-state.ts';
const s = fs.readFileSync(target, 'utf8');

const forbiddenFragments = [
  'hasInitiator',
  'seconderCount',
  'meetsMinimumSeconders',
  'canEnterPipeline',
];

const found = forbiddenFragments.filter(frag => s.includes(frag));
if (found.length) {
  console.log('STOP: remaining forbidden fragment(s) found -> ' + found.join(', '));
  process.exit(1);
}

console.log('NO_CHANGE_NEEDED_NO_REMAINING_FRAGMENTS');
