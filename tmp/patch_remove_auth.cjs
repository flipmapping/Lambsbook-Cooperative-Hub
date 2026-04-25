const fs = require('fs');

const file = 'server/routes/notification-preferences.route.ts';
let s = fs.readFileSync(file, 'utf8');

// remove middleware from GET
s = s.replace(
  'router.get("/", attachUserContext, async (req, res) => {',
  'router.get("/", async (req, res) => {'
);

// remove middleware from POST
s = s.replace(
  'router.post("/", attachUserContext, async (req, res) => {',
  'router.post("/", async (req, res) => {'
);

fs.writeFileSync(file, s);
console.log("AUTH_REMOVED_FROM_ROUTE");
