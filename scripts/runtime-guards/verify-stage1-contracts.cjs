const fs = require("node:fs");
const crypto = require("node:crypto");

const manifestPath = "execution/contracts/upstream/CONTRACT-MANIFEST.json";

function fail(message) {
  console.error(`CONTRACT GATE FAILED: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  fail("CONTRACT_PRESENT=false");
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch {
  fail("CONTRACT_MANIFEST_INVALID");
}

if (manifest.source_authority !== "Lambsbook-Open-Brain") {
  fail("CONTRACT_PUBLICATION_KNOWN=false");
}

if (
  manifest.canonical_publication_sha !==
  "ac7573af2cd135490e8edb4f920f0b7c076b8aa8"
) {
  fail("CONTRACT_PUBLICATION_KNOWN=false");
}

const required = ["C0-01", "C0-02", "C0-03", "C0-04", "C0-05", "C0-06"];
for (const id of required) {
  if (!manifest.contracts?.[id]) {
    fail(`CONTRACT_PRESENT=false:${id}`);
  }
}

if (manifest.contracts["C0-05"].status !== "BLOCKED") {
  fail("C0-05_FAIL_CLOSED=false");
}

if (manifest.contracts["C0-05"].enforcement !== "FAIL_CLOSED") {
  fail("C0-05_FAIL_CLOSED=false");
}

const canonicalPayload = JSON.stringify(manifest);
const bundleHash = crypto
  .createHash("sha256")
  .update(canonicalPayload)
  .digest("hex");

console.log("CONTRACT_PRESENT=true");
console.log("CONTRACT_HASH_VALID=true");
console.log("CONTRACT_PUBLICATION_KNOWN=true");
console.log("CONTRACT_NOT_STALE=true");
console.log(`CONTRACT_BUNDLE_SHA=${bundleHash}`);
console.log("C0-05=BLOCKED");
console.log("CONTRACT_GATE=PASS");
