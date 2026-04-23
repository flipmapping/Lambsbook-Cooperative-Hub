const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = `      </div>

    </div>`;
const insert = `      </div>

      <div className="mt-3">
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={() => setHasLocallySeconded((value) => !value)}
        >
          {hasLocallySeconded ? "Withdraw local recognition" : "Recognize locally"}
        </button>
      </div>

    </div>`;

if (!s.includes(anchor)) {
  console.log('STOP: local control anchor not found');
  process.exit(1);
}
if (s.includes('Recognize locally') || s.includes('Withdraw local recognition')) {
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
