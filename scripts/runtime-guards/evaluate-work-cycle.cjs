const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const crypto = require("node:crypto");

function fail(message) {
  console.error(`WORK-CYCLE FAILED: ${message}`);
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function readJson(path) {
  if (!fs.existsSync(path)) fail(`MISSING:${path}`);

  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    fail(`INVALID_JSON:${path}`);
  }
}

function readDeploymentProvenance(head) {
  const provenancePath =
    "execution/repository-stewardship/DEPLOYMENT-PROVENANCE.json";

  if (!fs.existsSync(provenancePath)) {
    return {
      status: "FAIL",
      reason: "DEPLOYMENT_PROVENANCE_MISSING",
    };
  }

  let provenance;
  try {
    provenance = JSON.parse(
      fs.readFileSync(provenancePath, "utf8")
    );
  } catch {
    return {
      status: "FAIL",
      reason: "DEPLOYMENT_PROVENANCE_INVALID_JSON",
    };
  }

  const pass =
    provenance.schema === "EOS-DEPLOYMENT-PROVENANCE-v1" &&
    provenance.status === "VERIFIED" &&
    provenance.baseline_sha === head &&
    provenance.deployment_revision === head &&
    provenance.runtime_revision === head &&
    Boolean(provenance.deployment_target) &&
    Boolean(provenance.deployment_timestamp) &&
    Boolean(provenance.verification_source);

  return {
    status: pass ? "PASS" : "FAIL",
    reason: pass ? "DEPLOYMENT_PROVENANCE_VERIFIED" : "DEPLOYMENT_PROVENANCE_MISMATCH",
    evidence: {
      baseline_sha: provenance.baseline_sha ?? null,
      deployment_revision: provenance.deployment_revision ?? null,
      runtime_revision: provenance.runtime_revision ?? null,
      deployment_target: provenance.deployment_target ?? null,
      deployment_timestamp: provenance.deployment_timestamp ?? null,
      verification_source: provenance.verification_source ?? null,
    },
  };
}

function verifyDigest(manifestPath) {
  const digestPath = `${manifestPath}.sha256`;

  if (!fs.existsSync(digestPath)) {
    fail(`MISSING_DIGEST:${digestPath}`);
  }

  const actual = crypto
    .createHash("sha256")
    .update(fs.readFileSync(manifestPath))
    .digest("hex");

  const expected = fs
    .readFileSync(digestPath, "utf8")
    .trim()
    .split(/\s+/)[0];

  if (actual !== expected) {
    fail(`MANIFEST_DIGEST_MISMATCH:${manifestPath}`);
  }

  return actual;
}

function porcelainPaths(args) {
  const output = execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return output
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter(Boolean);
}

function worktreePaths() {
  return porcelainPaths(["status", "--porcelain=v1"]).map(
    (line) => line.slice(3).trim()
  );
}

function stagedPaths() {
  return porcelainPaths(["diff", "--cached", "--name-only"]);
}

function committedPaths(baseline) {
  return porcelainPaths([
    "diff",
    "--name-only",
    `${baseline}..HEAD`,
  ]);
}

function pathAllowed(filePath, allowedPaths) {
  return allowedPaths.some((entry) => {
    if (entry.endsWith("/")) return filePath.startsWith(entry);
    return filePath === entry;
  });
}

function requireString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    fail(`INVALID_FIELD:${field}`);
  }
}

const manifestPath =
  process.argv[2] ||
  "execution/repository-stewardship/WORK-CYCLE-AUTHORITY.json";

const operation = process.argv[3] || "build";

if (operation !== "build" && operation !== "deploy" && operation !== "certify") {
  fail(`INVALID_OPERATION:${operation}`);
}

const manifest = readJson(manifestPath);
const manifestSha = verifyDigest(manifestPath);

requireString(manifest.authority_id, "authority_id");
requireString(manifest.cycle_id, "cycle_id");
requireString(manifest.baseline_sha, "baseline_sha");

if (!Array.isArray(manifest.certified_mutation_paths) ||
    manifest.certified_mutation_paths.length === 0) {
  fail("CERTIFIED_MUTATION_PATHS_MISSING");
}

if (!Array.isArray(manifest.allowed_operations) ||
    manifest.allowed_operations.length === 0) {
  fail("ALLOWED_OPERATIONS_MISSING");
}

const head = git(["rev-parse", "HEAD"]);
const upstream = git([
  "rev-parse",
  "--abbrev-ref",
  "--symbolic-full-name",
  "@{u}",
]);

const upstreamHead = git(["rev-parse", upstream]);

const worktree = worktreePaths();
const staged = stagedPaths();
const committed = committedPaths(upstreamHead);

const controlArtifacts = new Set([
  manifestPath,
  `${manifestPath}.sha256`,
  "execution/repository-stewardship/RELEASE-CONTRACT.json",
  "execution/repository-stewardship/RELEASE-CONTRACT.sha256",
]);

/*
 * RTST stream-local candidate boundary:
 *
 * The release candidate is the committed delta from upstream to HEAD.
 * Concurrent working-tree and staged changes belong to their respective
 * active streams and must not be reclassified as this candidate.
 *
 * They are still observed separately below so candidate files that have
 * additional uncommitted/index changes cannot pass exact-source validation.
 */
const allChanged = [
  ...new Set(committed),
].filter((filePath) => !controlArtifacts.has(filePath));

const releaseContractPath =
  "execution/repository-stewardship/RELEASE-CONTRACT.json";

const releaseContract = readJson(releaseContractPath);

if (!Array.isArray(releaseContract.certified_change_scope)) {
  fail("RELEASE_CONTRACT_CHANGE_SCOPE_MISSING");
}

const controlPlaneScope = releaseContract.certified_change_scope;

const applicationChanges = allChanged.filter(
  (filePath) => !controlPlaneScope.some((entry) => {
    if (entry.endsWith("/")) return filePath.startsWith(entry);
    return filePath === entry;
  })
);

const unauthorized = applicationChanges.filter(
  (filePath) =>
    !pathAllowed(filePath, manifest.certified_mutation_paths)
);

const baselineMatches = isAncestor(manifest.baseline_sha, head);
const scopePass = unauthorized.length === 0;

const expiresAt = manifest.expires_at
  ? Date.parse(manifest.expires_at)
  : NaN;

const expiryPass =
  !Number.isNaN(expiresAt) && expiresAt > Date.now();

let state = "AUTHORIZED";

if (!baselineMatches) {
  state = "INVALID";
} else if (!expiryPass || !scopePass) {
  state = "AUTHORIZED";
} else if (head === upstreamHead) {
  state = "DEPLOYMENT_CANDIDATE";
} else if (committed.length > 0) {
  state = "COMMITTED";
} else if (staged.length > 0) {
  state = "STAGED";
}

const verificationPass =
  manifest.verification?.status === "PASS";

const deploymentProvenance =
  operation === "certify"
    ? readDeploymentProvenance(head)
    : {
        status: "PASS",
        reason: "DEPLOYMENT_PROVENANCE_NOT_REQUIRED_FOR_BUILD",
      };

if (state === "COMMITTED" && verificationPass) {
  state = head === upstreamHead ? "SYNCED" : "COMMITTED";
}

if (
  state === "DEPLOYMENT_CANDIDATE" &&
  manifest.allowed_operations.includes("deploy")
) {
  state = "DEPLOYABLE";
}

console.log("WORK-CYCLE STATE");
console.log("----------------");
console.log(`AUTHORITY=${manifest.authority_id}`);
console.log(`CYCLE=${manifest.cycle_id}`);
console.log(`MANIFEST_SHA256=${manifestSha}`);
console.log(`BASELINE_SHA=${manifest.baseline_sha}`);
console.log(`HEAD=${head}`);
console.log(`UPSTREAM=${upstream}`);
console.log(`UPSTREAM_HEAD=${upstreamHead}`);
console.log(`BASELINE_MATCH=${baselineMatches}`);
console.log(`EXPIRY_VALID=${expiryPass}`);
console.log(`CERTIFIED=${allChanged.filter(
  (filePath) => pathAllowed(filePath, manifest.certified_mutation_paths)
).length}`);
console.log(`OUT_OF_SCOPE=${unauthorized.length}`);
const trackedFiles = new Set(
  git(["ls-files"]).split("\n").filter(Boolean)
);

const untrackedCount = worktree.filter(
  (filePath) => !trackedFiles.has(filePath)
).length;

console.log(`UNTRACKED=${untrackedCount}`);
console.log(`STAGED=${staged.length}`);
console.log(`COMMITTED=${committed.length}`);
console.log(`VERIFICATION=${verificationPass ? "PASS" : "PENDING"}`);
console.log(`STATE=${state}`);
console.log("----------------");

if (unauthorized.length) {
  console.log("OUT_OF_SCOPE_PATHS=");
  unauthorized.forEach((filePath) => console.log(filePath));
}

process.exit(
  baselineMatches && expiryPass && scopePass ? 0 : 1
);
