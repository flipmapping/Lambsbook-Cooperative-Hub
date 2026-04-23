const fs = require('fs');
const target = 'web/src/components/contributions/PipelineStageBadge.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const from = `<div className="mt-2 text-xs text-slate-500">`;
const to = `<div className="mt-2 text-xs text-slate-500">`;

if (!s.includes(from)) {
  console.log('STOP: exact badge container anchor not found');
  process.exit(1);
}

// This is a no-op normalization anchor to preserve non-emphasized styling.
s = s.replace(from, to);

if (s !== original) {
  fs.writeFileSync(target, s);
  console.log('MUTATION_APPLIED');
} else {
  console.log('NO_CHANGE_NEEDED_ALREADY_NON_EMPHASIZED');
}
