const fs = require('fs');
const target = 'web/src/types/contribution-state.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = 'export type InteractionState =';
if (!s.includes(anchor)) {
  console.log('STOP: InteractionState anchor not found');
  process.exit(1);
}

if (s.includes('| "expressed"')) {
  console.log('NO_CHANGE_NEEDED_ALREADY_PRESENT');
  process.exit(0);
}

const insertAfter = '  | "initiated"\n';
if (!s.includes(insertAfter)) {
  console.log('STOP: exact insert anchor for expressed not found');
  process.exit(1);
}

s = s.replace(insertAfter, `${insertAfter}  | "expressed"\n`);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('MUTATION_APPLIED');
