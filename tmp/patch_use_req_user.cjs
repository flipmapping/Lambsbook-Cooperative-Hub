const fs = require('fs');

const file = 'server/routes/notification-preferences.route.ts';
let s = fs.readFileSync(file, 'utf8');

// --- GET handler ---
// remove query destructure
s = s.replace(
  'const { recipientId, recipientType } = req.query;',
  'const user = req.user as any;\n    if (!user?.id) {\n      return res.status(401).json({ error: "Unauthenticated" });\n    }\n    const recipientId = user.id;\n    const recipientType = "member";'
);

// remove missing-fields check for query (no longer needed)
s = s.replace(
  'if (!recipientId || !recipientType) {\n      return res.status(400).json({ error: "Missing recipientId or recipientType" });\n    }\n\n',
  ''
);

// --- POST handler ---
// remove body identity usage
s = s.replace(
  'const { recipientId, recipientType, enabled, channel } = req.body;',
  'const { enabled, channel } = req.body;\n    const user = req.user as any;\n    if (!user?.id) {\n      return res.status(401).json({ error: "Unauthenticated" });\n    }\n    const recipientId = user.id;\n    const recipientType = "member";'
);

// keep required fields check but remove recipient checks
s = s.replace(
  'if (!recipientId || !recipientType || !channel) {',
  'if (!channel) {'
);

fs.writeFileSync(file, s);
console.log("REQ_USER_APPLIED");
