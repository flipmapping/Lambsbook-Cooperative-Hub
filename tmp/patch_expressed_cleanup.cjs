const fs = require('fs');
const target = 'web/src/types/contribution-state.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const from = `    case "expressed":
      return [
        "Contribution has entered pipeline",
        "Initiator is recorded",
        "At least 2 seconders are recorded",
      ];`;

const to = `    case "expressed":
      return [
        "Contribution is visibly in shared progression",
      ];`;

if (!s.includes(from)) {
  console.log('STOP: exact expressed case block not found');
  process.exit(1);
}

s = s.replace(from, to);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
