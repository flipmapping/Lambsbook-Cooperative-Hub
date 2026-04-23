const fs = require('fs');
const target = 'web/src/components/contributions/ContributionCard.tsx';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const anchor = 'import type { Contribution } from "@/types/contribution";';
const insert = 'import { useState } from "react";\nimport type { Contribution } from "@/types/contribution";';

if (!s.includes(anchor)) {
  console.log('STOP: import anchor not found');
  process.exit(1);
}
if (s.includes('import { useState } from "react";')) {
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
