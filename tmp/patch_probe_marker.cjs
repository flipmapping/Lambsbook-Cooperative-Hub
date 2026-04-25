const fs = require('fs');

const file = 'server/routes.ts';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  'res.json({ ok: true, source: "express" });',
  'res.json({ ok: true, source: "express", __probe_marker__: "' + process.env.PROBE_ID + '" });'
);

fs.writeFileSync(file, s);
console.log("PATCHED");
