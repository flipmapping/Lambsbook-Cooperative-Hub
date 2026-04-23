const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = `        {contribution.interactionState === "initiated" && (
          <div>Shared for consideration</div>
        )}`;
const insert = `        {contribution.interactionState === "initiated" && (
          <div>Shared for consideration</div>
        )}
        {hasLocallyInitiated && (
          <div className="text-xs text-slate-400">Your sharing is recorded locally for consideration in this view only.</div>
        )}`;

if (!s.includes(anchor)) {
  console.log('STOP: initiated signal anchor not found');
  process.exit(1);
}
if (s.includes('Your sharing is recorded locally for consideration in this view only.')) {
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
