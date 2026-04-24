const fs = require('fs');

const file = 'client/src/pages/Dashboard.tsx';
let s = fs.readFileSync(file, 'utf8');
const original = s;

const anchor = `<CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>`;

if (!s.includes(anchor)) {
  console.log('STOP: anchor not found');
  process.exit(1);
}

const insert = `${anchor}

                  <div className="mt-4">
                    <NotificationPreferencesPanel />
                  </div>`;

s = s.replace(anchor, insert);

if (s === original) {
  console.log('STOP: no change applied');
  process.exit(1);
}

fs.writeFileSync(file, s);
console.log('INSERT_APPLIED');
