const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const from = '<div className="text-slate-600">Your recognition is recorded locally for this view only.</div>';
const to = '<div className="text-xs text-slate-400">Your recognition is recorded locally for this view only.</div>';

if (!s.includes(from)) {
  console.log('STOP: exact local signal line not found');
  process.exit(1);
}

s = s.replace(from, to);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
