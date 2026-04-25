const fs = require('fs');

const file = 'client/src/components/notifications/NotificationPreferencesPanel.tsx';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  '.then(res => res.json())',
  `.then(res => {
        if (!res.ok) return null;
        return res.json();
      })`
);

fs.writeFileSync(file, s);
console.log("401_HANDLING_ADDED");
