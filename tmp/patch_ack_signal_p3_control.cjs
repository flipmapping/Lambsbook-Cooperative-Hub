const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = `        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallyClarified((value) => !value)}
        >
          {hasLocallyClarified ? "Hide local clarification" : "Show local clarification"}
        </button>`;
const insert = `        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallyClarified((value) => !value)}
        >
          {hasLocallyClarified ? "Hide local clarification" : "Show local clarification"}
        </button>
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500"
          onClick={() => setHasLocallyAcknowledged((value) => !value)}
        >
          {hasLocallyAcknowledged ? "Unmark local acknowledgment" : "Mark as seen locally"}
        </button>`;

if (!s.includes(anchor)) {
  console.log('STOP: clarification control anchor not found');
  process.exit(1);
}
if (s.includes('Mark as seen locally') || s.includes('Unmark local acknowledgment')) {
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
