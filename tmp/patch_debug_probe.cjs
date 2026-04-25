const fs = require('fs');

const file = 'server/routes.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('DEBUG_API_PROBE')) {
  console.log('ALREADY_EXISTS');
  process.exit(0);
}

const anchor = 'app.get("/api/dashboard/stats"';

if (!s.includes(anchor)) {
  console.log('STOP: anchor not found');
  process.exit(1);
}

const insert = `
  app.get("/api/__probe", (req, res) => {
    console.log("DEBUG_API_PROBE_HIT");
    res.json({ ok: true, source: "express" });
  });
`;

s = s.replace(anchor, insert + "\n  " + anchor);

fs.writeFileSync(file, s);
console.log("PROBE_ADDED");
