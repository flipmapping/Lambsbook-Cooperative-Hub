const fs = require('fs');

const file = 'package.json';
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));

pkg.scripts.dev = "bash scripts/runtime-guard.sh";

fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
console.log("DEV_SCRIPT_UPDATED");
