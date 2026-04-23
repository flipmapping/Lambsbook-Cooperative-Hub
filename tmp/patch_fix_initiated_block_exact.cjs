const fs = require('fs');

const target = 'web/src/lib/contributions/mock-data.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const bad =
`  {
  {
    interactionState: "initiated",
    id: "contrib_003",`;

const good =
`  {
    interactionState: "initiated",
    id: "contrib_003",`;

if (!s.includes(bad)) {
  console.log('STOP: exact bad block anchor not found');
  process.exit(1);
}

s = s.replace(bad, good);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(target, s);
console.log('FIX_APPLIED');
