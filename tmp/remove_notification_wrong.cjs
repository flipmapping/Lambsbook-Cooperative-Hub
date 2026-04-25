const fs = require('fs');

const file = 'client/src/pages/Dashboard.tsx';
let s = fs.readFileSync(file, 'utf8');
const original = s;

const block = `
                  <div className="mt-4">
                    <NotificationPreferencesPanel />
                  </div>`;

if (!s.includes(block)) {
  console.log('STOP: block not found (already removed or mismatch)');
  process.exit(1);
}

s = s.replace(block, '');

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(file, s);
console.log('REMOVED_WRONG_INSERT');
