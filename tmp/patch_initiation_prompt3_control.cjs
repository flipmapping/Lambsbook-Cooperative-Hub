const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = `      <div className="mt-3">
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallySeconded((value) => !value)}
        >
          {hasLocallySeconded ? "Withdraw local recognition" : "Recognize locally"}
        </button>
      </div>`;
const insert = `      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallySeconded((value) => !value)}
        >
          {hasLocallySeconded ? "Withdraw local recognition" : "Recognize locally"}
        </button>
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallyInitiated((value) => !value)}
        >
          {hasLocallyInitiated ? "Withdraw local sharing" : "Share locally for consideration"}
        </button>
      </div>`;

if (!s.includes(anchor)) {
  console.log('STOP: seconding control anchor not found');
  process.exit(1);
}
if (s.includes('Share locally for consideration') || s.includes('Withdraw local sharing')) {
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
