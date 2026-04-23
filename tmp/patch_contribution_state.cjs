const fs = require('fs');

const target = 'web/src/types/contribution-state.ts';
let s = fs.readFileSync(target, 'utf8');
const original = s;

const unifiedBlock =
`export type InteractionState =
  | "uninitiated"
  | "initiated"
  | "expressed"
  | "acknowledged"
  | "engaged"
  | "materialized"
  | "archived";`;

if (!/export type InteractionState\s*=/.test(s)) {
  if (/export type PipelineStage\s*=/.test(s)) {
    s = s.replace(/export type PipelineStage\s*=\s*[\s\S]*?;/, m => `${m}\n\n${unifiedBlock}`);
  } else {
    s = `${unifiedBlock}\n\n${s}`;
  }
}

if (s === original) {
  console.log('NO_CHANGE_NEEDED_OR_ALREADY_APPLIED');
} else {
  fs.writeFileSync(target, s);
  console.log('MUTATION_APPLIED');
}
