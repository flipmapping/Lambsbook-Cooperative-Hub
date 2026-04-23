const fs = require('fs');

const target = 'web/src/lib/contributions/mock-data.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor1 = `  {\n    id: "contrib_001",`;
const replace1 = `  {\n    interactionState: "uninitiated",\n    id: "contrib_001",`;

const anchor2 = `  {\n    id: "contrib_002",`;
const replace2 = `  {\n    interactionState: "expressed",\n    id: "contrib_002",`;

if (!s.includes(anchor1)) {
  console.log('STOP: contrib_001 anchor not found');
  process.exit(1);
}
if (!s.includes(anchor2)) {
  console.log('STOP: contrib_002 anchor not found');
  process.exit(1);
}

if (!s.includes(`interactionState: "uninitiated"`)) {
  s = s.replace(anchor1, replace1);
}
if (!s.includes(`interactionState: "expressed"`)) {
  s = s.replace(anchor2, replace2);
}

if (s === original) {
  console.log('NO_CHANGE_NEEDED_OR_ALREADY_APPLIED');
} else {
  fs.writeFileSync(target, s);
  console.log('MUTATION_APPLIED');
}
