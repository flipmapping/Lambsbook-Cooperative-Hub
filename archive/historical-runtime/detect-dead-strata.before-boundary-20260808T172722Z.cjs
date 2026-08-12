const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const EXCLUDED = [
  'node_modules',
  '.next',
  '.cache',
  'dist',
  'build',
  'coverage',
  '.git'
];

const targets = [];

const EXCLUDED_PATH_FRAGMENTS = [
  'scripts/runtime-guards/',
  'topology-convergence/runtime-maps/'
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED.includes(entry.name)) continue;
      walk(full);
      continue;
    }

    if (!/\.(ts|tsx|js|cjs)$/.test(entry.name)) continue;

    const relative = path.relative(ROOT, full);

    if (
      EXCLUDED_PATH_FRAGMENTS.some(fragment =>
        relative.includes(fragment)
      )
    ) {
      continue;
    }

    const content = fs.readFileSync(full, 'utf8');

    if (
      content.includes('PHASE 1 CONTAINMENT') ||
      content.includes('residual embedded hub member bridge removed')
    ) {
      targets.push(path.relative(ROOT, full));
    }
  }
}

walk(ROOT);

console.log('\n=== DEAD STRATA REGIONS ===\n');

for (const t of targets) {
  console.log(t);
}

console.log(`\nTotal regions: ${targets.length}\n`);
