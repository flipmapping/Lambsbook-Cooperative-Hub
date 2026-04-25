const fs = require('fs');

const file = 'server/routes/notification-preferences.route.ts';
let s = fs.readFileSync(file, 'utf8');

// Remove ANY remaining recipient validation blocks
s = s.replace(/if\s*\(\s*!recipientId\s*\|\|\s*!recipientType\s*\)\s*\{[^}]*\}/g, '');

fs.writeFileSync(file, s);
console.log("VALIDATION_REMOVED");
