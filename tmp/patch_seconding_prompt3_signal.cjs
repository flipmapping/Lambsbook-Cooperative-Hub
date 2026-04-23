const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = `        {contribution.seconders && contribution.seconders.length > 0 && (
          <div>
            Recognized by {contribution.seconders.length} {contribution.seconders.length === 1 ? "member" : "members"}
          </div>
        )}`;
const insert = `        {contribution.seconders && contribution.seconders.length > 0 && (
          <div>
            Recognized by {contribution.seconders.length} {contribution.seconders.length === 1 ? "member" : "members"}
          </div>
        )}
        {hasLocallySeconded && (
          <div className="text-slate-600">Your recognition is recorded locally for this view only.</div>
        )}`;

if (!s.includes(anchor)) {
  console.log('STOP: canonical recognition anchor not found');
  process.exit(1);
}
if (s.includes('Your recognition is recorded locally for this view only.')) {
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
