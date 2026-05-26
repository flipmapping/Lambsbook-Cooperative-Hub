const fs = require('fs');

const routesFile = 'server/routes.ts';

const content = fs.readFileSync(routesFile, 'utf8');

const required = [
  'app.use("/api/member", memberRoutes);'
];

const forbidden = [
  'app.use("/api/hub/member"',
];

let failed = false;

console.log('\n=== CANONICAL TOPOLOGY ASSERTION ===\n');

for (const item of required) {
  if (!content.includes(item)) {
    console.error(`[MISSING REQUIRED] ${item}`);
    failed = true;
  } else {
    console.log(`[OK REQUIRED] ${item}`);
  }
}

for (const item of forbidden) {
  if (content.includes(item)) {
    console.error(`[FORBIDDEN] ${item}`);
    failed = true;
  } else {
    console.log(`[OK FORBIDDEN] ${item}`);
  }
}

if (failed) {
  console.error('\nTopology assertion FAILED.\n');
  process.exit(1);
}

console.log('\nTopology assertion PASSED.\n');
