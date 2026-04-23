const fs = require('fs');
const target = 'web/src/components/contributions/PipelineStageBadge.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = `    case "expressed":
      return "Now in progression";`;

if (s.includes(anchor)) {
  console.log('NO_CHANGE_NEEDED_ALREADY_CORRECT');
  process.exit(0);
}

const caseAnchor = `    case "expressed":`;
if (!s.includes(caseAnchor)) {
  console.log('STOP: expressed case anchor not found');
  process.exit(1);
}

const patterns = [
  /case "expressed":[\s\S]*?return "([^"]+)";/,
];

let changed = false;
for (const re of patterns) {
  if (re.test(s)) {
    s = s.replace(re, `case "expressed":\n      return "Now in progression";`);
    changed = true;
    break;
  }
}

if (!changed) {
  console.log('STOP: could not safely normalize expressed wording');
  process.exit(1);
}

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
