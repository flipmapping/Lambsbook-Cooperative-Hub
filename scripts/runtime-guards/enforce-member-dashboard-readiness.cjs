#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const target = path.join(root, "client", "src", "pages", "MemberHub.tsx");
const source = fs.readFileSync(target, "utf8");

const readinessMatch = source.match(
  /const\s+isDashboardLoading\s*=\s*([^;]+);/
);

if (!readinessMatch) {
  console.error("MEMBER DASHBOARD READINESS GUARD FAILED: readiness declaration not found.");
  process.exit(1);
}

const expression = readinessMatch[1].replace(/\s+/g, " ").trim();

if (expression !== "profileLoading") {
  console.error(
    "MEMBER DASHBOARD READINESS GUARD FAILED: dashboard readiness must depend only on profileLoading."
  );
  console.error(`Actual expression: ${expression}`);
  process.exit(1);
}

const forbidden = [
  "activityLoading",
  "earningsLoading",
  "invitationLoading",
  "relationshipsLoading",
  "sentInvitationsLoading",
];

for (const token of forbidden) {
  if (new RegExp(`isDashboardLoading\\s*=\\s*[^;]*\\b${token}\\b`).test(source)) {
    console.error(
      `MEMBER DASHBOARD READINESS GUARD FAILED: ${token} gates dashboard readiness.`
    );
    process.exit(1);
  }
}

console.log("MEMBER DASHBOARD READINESS GUARD: PASS");
console.log("Blocking authority: profileLoading");
console.log("Secondary query loading states: non-blocking");
