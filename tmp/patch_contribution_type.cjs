const fs = require('fs');

const target = 'web/src/types/contribution.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

if (!/InteractionState/.test(s)) {
  if (/from\s+["'][^"']*contribution-state["']/.test(s)) {
    s = s.replace(
      /(from\s+["'][^"']*contribution-state["'];?)/,
      m => m.includes('InteractionState') ? m : m.replace(/(import\s+type\s*{)([^}]*)(})/, (_, a, b, c) => `${a}${b}, InteractionState${c}`)
    );
  } else {
    s = `import type { InteractionState } from "./contribution-state";\n${s}`;
  }
}

if (!/interactionState\??:\s*InteractionState/.test(s)) {
  const interfaceMatch = s.match(/export interface Contribution\s*{([\s\S]*?)\n}/);
  if (!interfaceMatch) {
    console.log('STOP: Contribution interface not found');
    process.exit(1);
  }
  s = s.replace(/export interface Contribution\s*{/, 'export interface Contribution {\n  interactionState: InteractionState;');
}

if (s === original) {
  console.log('NO_CHANGE_NEEDED_OR_ALREADY_APPLIED');
} else {
  fs.writeFileSync(target, s);
  console.log('MUTATION_APPLIED');
}
