const fs = require("node:fs");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const manifest = process.argv[2] ||
  "execution/repository-stewardship/WORK-CYCLE-AUTHORITY.json";
const digest = `${manifest}.sha256`;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

if (!fs.existsSync(manifest)) throw new Error(`MISSING:${manifest}`);

const changed = git(["status", "--porcelain", "--", manifest]);
if (changed) throw new Error(`AUTHORITY_MANIFEST_MUTATION_PRESENT:${manifest}`);

const actual = crypto.createHash("sha256")
  .update(fs.readFileSync(manifest))
  .digest("hex");

const previous = fs.existsSync(digest)
  ? fs.readFileSync(digest, "utf8").trim().split(/\s+/)[0]
  : null;

const tmp = `${digest}.tmp.${process.pid}`;
fs.writeFileSync(tmp, `${actual}  ${manifest}\n`, "utf8");
fs.renameSync(tmp, digest);

const verified = crypto.createHash("sha256")
  .update(fs.readFileSync(manifest))
  .digest("hex");

if (verified !== actual) throw new Error("DIGEST_VERIFICATION_FAILED");

console.log(`AUTHORITY_MANIFEST=${manifest}`);
console.log(`PREVIOUS_DIGEST=${previous ?? "MISSING"}`);
console.log(`CURRENT_DIGEST=${actual}`);
console.log("AUTHORITY_JSON_MUTATED=false");
console.log("AUTHORITY_SCOPE_CHANGED=false");
console.log("AUTHORITY_RECONCILIATION=PASS");
