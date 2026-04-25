const fs = require('fs');

const file = 'server/routes/notification-preferences.route.ts';
let s = fs.readFileSync(file, 'utf8');

// 1. add import if missing
if (!s.includes('attachUserContext')) {
  s = s.replace(
    'import { storage } from "../storage";',
    'import { storage } from "../storage";\nimport { attachUserContext } from "../middleware/attachUserContext";'
  );
}

// 2. wrap GET route
s = s.replace(
  'router.get("/", async (req, res) => {',
  'router.get("/", attachUserContext, async (req, res) => {'
);

// 3. wrap POST route
s = s.replace(
  'router.post("/", async (req, res) => {',
  'router.post("/", attachUserContext, async (req, res) => {'
);

fs.writeFileSync(file, s);
console.log("ATTACH_USER_CONTEXT_ADDED");
