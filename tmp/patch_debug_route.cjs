const fs = require('fs');

const file = 'server/routes/notification-preferences.route.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('DEBUG_NOTIFICATION_ROUTE_HIT')) {
  console.log('ALREADY_PATCHED');
  process.exit(0);
}

s = s.replace(
  'router.get("/", async (req, res) => {',
  `router.get("/", async (req, res) => {
    console.log("DEBUG_NOTIFICATION_ROUTE_HIT");`
);

fs.writeFileSync(file, s);
console.log('DEBUG_LOG_INSERTED');
