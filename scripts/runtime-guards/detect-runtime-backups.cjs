const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const EXCLUDED = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.runtime-backup-quarantine'
];

const violations = [];

const RUNTIME_ROOTS = [
  'client/src',
  'server',
  'scripts',
  'shared'
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED.includes(entry.name)) continue;
      walk(full);
      continue;
    }

    if (
      entry.name.includes('.bak') ||
      entry.name.includes('.backup') ||
      entry.name.includes('.phase') ||
      entry.name.includes('.before_')
    ) {
      violations.push(path.relative(ROOT, full));
    }
  }
}

for (const root of RUNTIME_ROOTS) {
  if (fs.existsSync(root)) {
    walk(path.join(ROOT, root));
  }
}

console.log('\n=== RUNTIME BACKUP FILES ===\n');

for (const v of violations) {
  console.log(v);
}

console.log(`\nTotal backup artifacts: ${violations.length}\n`);

if (violations.length > 0) {
  process.exit(1);
}
