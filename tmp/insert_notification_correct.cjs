const fs = require('fs');

const file = 'client/src/pages/Dashboard.tsx';
let s = fs.readFileSync(file, 'utf8');
const original = s;

const anchor = `</div>

                <div className="grid gap-6 lg:grid-cols-2">`;

if (!s.includes(anchor)) {
  console.log('STOP: anchor not found');
  process.exit(1);
}

const replacement = `</div>

                <div className="mt-4">
                  <NotificationPreferencesPanel />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">`;

s = s.replace(anchor, replacement);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(file, s);
console.log('INSERT_APPLIED_CORRECT_POSITION');
