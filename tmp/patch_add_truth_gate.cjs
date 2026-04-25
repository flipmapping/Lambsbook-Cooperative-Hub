const fs = require('fs');

const file = 'package.json';
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));

pkg.scripts = pkg.scripts || {};

if (pkg.scripts["truth:gate"] === "bash scripts/run-truth-gate.sh") {
  console.log("NO_CHANGE_ALREADY_PRESENT");
  process.exit(0);
}

pkg.scripts["truth:gate"] = "bash scripts/run-truth-gate.sh";

fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log("SCRIPT_ADDED");
