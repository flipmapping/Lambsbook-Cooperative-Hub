const fs = require('fs');
const path = require('path');
const { scan } = require('../repository/traversal.cjs');

const ROOT = process.cwd();

const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  '.cache',
  'dist',
  'build',
  'coverage',
  '.git'
];

const EXCLUDED_PATH_FRAGMENTS = [
  'topology-convergence/runtime-maps/',
  'scripts/runtime-guards/',
  '.bak'
];

const violations = [];

function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function shouldExclude(relative) {
  return EXCLUDED_PATH_FRAGMENTS.some(fragment =>
    relative.includes(fragment)
  );
}

const visited = new Set();
const MAX_DEPTH = 50;

function walk(dir, depth = 0) {

  if (depth > MAX_DEPTH) {
    violations.push({
      type: 'TRAVERSAL_DEPTH_EXCEEDED',
      file: path.relative(ROOT, dir)
    });
    return;
  }

  let real;

  try {
    real = fs.realpathSync(dir);
  } catch {
    return;
  }

  if (visited.has(real))
    return;

  visited.add(real);

  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {

    const full = path.join(dir, entry.name);

    if (entry.isSymbolicLink())
      continue;

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.includes(entry.name)) continue;
      walk(full, depth + 1);
      continue;
    }

    if (!/\.(ts|tsx|js|cjs)$/.test(entry.name)) continue;

    const relative = path.relative(ROOT, full);

    if (shouldExclude(relative)) continue;

    const raw = fs.readFileSync(full, 'utf8');
    const content = stripComments(raw);

    if (
      content.includes('auth.getUser') &&
      !relative.includes('attachUserContext') &&
      !relative.includes('getUserEmailFromToken') &&
      !relative.includes('supabase-auth')
    ) {
      violations.push({
        type: 'NON_CANONICAL_AUTH_RECOVERY',
        file: relative
      });
    }

    if (
      /\/api\/hub\/member\//.test(content)
    ) {
      violations.push({
        type: 'LEGACY_MEMBER_RUNTIME_CORRIDOR',
        file: relative
      });
    }

    if (
      /memberRouter|membersRouter/.test(content)
    ) {
      violations.push({
        type: 'PARALLEL_MEMBER_ROUTER',
        file: relative
      });
    }

    if (
      /insert.*meh\.members|update.*meh\.members/i.test(content)
    ) {
      violations.push({
        type: 'DIRECT_MEH_MEMBERS_WRITE',
        file: relative
      });
    }
  }
}

walk(ROOT);

if (violations.length > 0) {
  console.error('\n=== CANONICAL RUNTIME VIOLATIONS ===\n');

  for (const v of violations) {
    console.error(`[${v.type}] ${v.file}`);
  }

  console.error(`\nViolation count: ${violations.length}\n`);
  process.exit(1);
}

console.log('\nCanonical runtime enforcement passed.\n');
