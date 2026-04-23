const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = `        {hasLocallySeconded && (
          <div className="text-xs text-slate-400">Your recognition is recorded locally for this view only.</div>
        )}`;
const insert = `        {hasLocallySeconded && (
          <div className="text-xs text-slate-400">Your recognition is recorded locally for this view only.</div>
        )}
        {hasLocallyClarified && (
          <div className="text-xs text-slate-400">Local clarification for this view only.</div>
        )}`;

if (!s.includes(anchor)) {
  console.log('STOP: local seconding signal anchor not found');
  process.exit(1);
}
if (s.includes('Local clarification for this view only.')) {
  console.log('NO_CHANGE_NEEDED_ALREADY_PRESENT');
  process.exit(0);
}

s = s.replace(anchor, insert);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
