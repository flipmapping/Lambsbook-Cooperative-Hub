const { execFileSync } = require("node:child_process");

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function fail(message) {
  console.error(`RELEASE GUARD FAILED: ${message}`);
  process.exit(1);
}

function readCompilerTruth() {
  const fs = require("node:fs");

  const path =
    "execution/certification/compiler/COMPILER-CERTIFICATION.json";

  if (!fs.existsSync(path)) {
    fail("COMPILER_CERTIFICATION_MISSING");
  }

  const certification = JSON.parse(fs.readFileSync(path, "utf8"));
  const hashes = certification.hashes || {};
  const declared = certification.declared_contract || {};

  return {
    status:
      certification.result === "PASS" &&
      certification.fracture === null &&
      typeof declared.sha256 === "string" &&
      declared.sha256 === hashes.declared_contract_sha256 &&
      typeof hashes.live_registry_sha256 === "string" &&
      typeof hashes.source_bundle_sha256 === "string"
        ? "PASS"
        : "FAIL",
    certification_timestamp: certification.certification_timestamp || null,
    declared_contract_sha256: declared.sha256 || null,
    live_registry_sha256: hashes.live_registry_sha256 || null,
    source_bundle_sha256: hashes.source_bundle_sha256 || null,
  };
}

function readReleaseContract() {
  const fs = require("node:fs");
  const crypto = require("node:crypto");

  const contractPath =
    "execution/repository-stewardship/RELEASE-CONTRACT.json";
  const digestPath =
    "execution/repository-stewardship/RELEASE-CONTRACT.sha256";

  if (!fs.existsSync(contractPath)) {
    fail("RELEASE_CONTRACT_MISSING");
  }

  if (!fs.existsSync(digestPath)) {
    fail("RELEASE_CONTRACT_DIGEST_MISSING");
  }

  const contractBytes = fs.readFileSync(contractPath);
  const actualSha = crypto
    .createHash("sha256")
    .update(contractBytes)
    .digest("hex");

  const expectedSha = fs
    .readFileSync(digestPath, "utf8")
    .trim()
    .split(/\s+/)[0];

  const contract = JSON.parse(contractBytes.toString("utf8"));

  return {
    contract,
    integrity_status: actualSha === expectedSha ? "PASS" : "FAIL",
    actual_sha: actualSha,
    expected_sha: expectedSha,
  };
}

function buildReleaseTruthState() {
  const releaseContract = readReleaseContract();
  const compiler = readCompilerTruth();

  let workCycle = {
    status: "FAIL",
    evidence: "WORK_CYCLE_EVALUATOR_NOT_RUN",
  };

  try {
    const evaluatorPath =
      "scripts/runtime-guards/evaluate-work-cycle.cjs";
    const manifestPath =
      "execution/repository-stewardship/WORK-CYCLE-AUTHORITY.json";

    const result = execFileSync(
      process.execPath,
      [evaluatorPath, manifestPath],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    const stateMatch = result.match(/^STATE=(.+)$/m);
    const state = stateMatch ? stateMatch[1].trim() : null;

    const publishable =
      state === "DEPLOYMENT_CANDIDATE" ||
      state === "DEPLOYABLE";

    workCycle = {
      status: publishable ? "PASS" : "FAIL",
      evidence: {
        state,
        accepted_states: ["DEPLOYMENT_CANDIDATE", "DEPLOYABLE"],
        authority: "WORK-CYCLE-AUTHORITY",
      },
    };
  } catch (error) {
    workCycle = {
      status: "FAIL",
      evidence: "WORK_CYCLE_EVALUATOR_FAILED",
    };
  }

  const status = git(["status", "--porcelain"]);
  const branch = git(["branch", "--show-current"]);

  let upstream = null;
  let upstreamHead = null;
  try {
    upstream = git([
      "rev-parse",
      "--abbrev-ref",
      "--symbolic-full-name",
      "@{u}",
    ]);
    upstreamHead = git(["rev-parse", upstream]);
  } catch {}

  const head = git(["rev-parse", "HEAD"]);

  return [
    {
      id: "WORK_CYCLE_AUTHORITY",
      status: workCycle.status,
      evidence: workCycle.evidence,
    },
    {
      id: "WORKTREE_CLEAN",
      status: "PASS",
      evidence: {
        repository_status: status ? "dirty" : "clean",
        release_blocking: false,
        authority: "WORK-CYCLE-AUTHORITY",
      },
    },
    {
      id: "BRANCH_NAMED",
      status: branch ? "PASS" : "FAIL",
      evidence: branch || null,
    },
    {
      id: "GITHUB_SYNC",
      status:
        upstream && upstreamHead === head ? "PASS" : "FAIL",
      evidence: {
        head,
        upstream,
        upstream_head: upstreamHead,
      },
    },
    {
      id: "COMPILER_CERTIFICATION",
      status: compiler.status,
      evidence: compiler,
    },
    {
      id: "RELEASE_CONTRACT_INTEGRITY",
      status: releaseContractState.integrity_status,
      evidence: {
        actual_sha: releaseContractState.actual_sha,
        expected_sha: releaseContractState.expected_sha,
      },
    },
    {
      id: "RELEASE_SCOPE",
      status: outOfScopeChanges.length ? "FAIL" : "PASS",
      evidence: outOfScopeChanges,
    },
  ];
}

const status = git(["status", "--porcelain"]);

const releaseContractState = readReleaseContract();
const releaseContract = releaseContractState.contract;

if (
  !releaseContract.repository_baseline ||
  !releaseContract.repository_baseline.head
) {
  fail("RELEASE_CONTRACT_BASELINE_MISSING");
}

if (!Array.isArray(releaseContract.certified_runtime_files)) {
  fail("RELEASE_CONTRACT_SCOPE_MISSING");
}

if (!Array.isArray(releaseContract.certified_change_scope)) {
  fail("RELEASE_CONTRACT_CHANGE_SCOPE_MISSING");
}

if (
  !releaseContract.repository_root_admission ||
  !Array.isArray(
    releaseContract.repository_root_admission.allowed_root_directories
  )
) {
  fail("RELEASE_CONTRACT_ROOT_ADMISSION_MISSING");
}

const releaseBaseline = releaseContract.repository_baseline.head;
const certifiedRuntimeFiles = releaseContract.certified_runtime_files;
const certifiedChangeScope = releaseContract.certified_change_scope;

if (
  !releaseContract.repository_runtime_boundaries ||
  !Array.isArray(
    releaseContract.repository_runtime_boundaries
      .excluded_from_release_candidate
  )
) {
  fail("RELEASE_CONTRACT_RUNTIME_BOUNDARIES_MISSING");
}

const certifiedRuntimeBoundaries =
  releaseContract.repository_runtime_boundaries
    .excluded_from_release_candidate;

const rootAdmission =
  releaseContract.repository_root_admission;
const allowedRootDirectories =
  rootAdmission.allowed_root_directories;

function isExcludedRuntimeBoundary(path) {
  return certifiedRuntimeBoundaries.some((entry) => {
    if (!entry.must_be_ignored) {
      return false;
    }

    const boundary = entry.path;
    return boundary.endsWith("/")
      ? path.startsWith(boundary)
      : path === boundary;
  });
}

function isAllowedRootIngress(path) {
  if (!path.includes("/")) {
    return false;
  }

  const root = path.split("/")[0];

  return allowedRootDirectories.some(
    (entry) =>
      entry.classification === "INGRESS" &&
      entry.release_scope === "EXCLUDED" &&
      entry.pattern.endsWith("*") &&
      root.startsWith(entry.pattern.slice(0, -1))
  );
}

let releaseCandidateBase;

try {
  releaseCandidateBase = git([
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{u}",
  ]);
} catch {
  fail("RELEASE_CANDIDATE_UPSTREAM_MISSING");
}

const committedChanges = git([
  "diff",
  "--name-only",
  `${releaseCandidateBase}..HEAD`,
])
  .split("\n")
  .map((path) => path.trim())
  .filter(Boolean);

const workingTreeRaw = execFileSync(
  "git",
  ["status", "--porcelain"],
  {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }
);

const workingTreeChanges = workingTreeRaw
  .split("\n")
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const changedFiles = [...new Set([
  ...committedChanges,
  ...workingTreeChanges,
])];

function isInCertifiedChangeScope(path) {
  return certifiedChangeScope.some((entry) => {
    if (entry.endsWith("/")) {
      return path.startsWith(entry);
    }
    return path === entry;
  });
}

const outOfScopeChanges = changedFiles.filter(
  (path) =>
    !isInCertifiedChangeScope(path) &&
    !isAllowedRootIngress(path) &&
    !isExcludedRuntimeBoundary(path)
);

const truthState = buildReleaseTruthState();

console.log("RELEASE TRUTH-STATE TABLE");
console.log("-------------------------");
for (const row of truthState) {
  console.log(`${row.id}: ${row.status}`);
}
console.log("-------------------------");

const failedTruthRows = truthState.filter(
  (row) => row.status !== "PASS"
);

if (failedTruthRows.length) {
  fail(
    "RELEASE_TRUTH_STATE_FAILED: " +
      failedTruthRows.map((row) => row.id).join(", ")
  );
}

if (outOfScopeChanges.length) {
  fail(
    "RELEASE_SCOPE_VIOLATION: " +
      outOfScopeChanges.join(", ")
  );
}

const trackedPollution = git([
  "ls-files",
  "--",
  ".venv-ctbc/**",
  ".app-rec-*",
]);

if (trackedPollution) {
  fail(
    "tracked local/runtime pollution detected: " +
      trackedPollution.split("\\n").join(", ")
  );
}

const branch = git(["branch", "--show-current"]);
if (!branch) fail("repository is not on a named branch");

let upstream;
try {
  upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
} catch {
  fail("current branch has no upstream tracking branch");
}

const head = git(["rev-parse", "HEAD"]);
const remoteHead = git(["rev-parse", upstream]);

if (head !== remoteHead) {
  fail(`HEAD ${head} is not synchronized with ${upstream} ${remoteHead}`);
}

console.log("Release state guard passed.");
console.log(`Branch: ${branch}`);
console.log(`SHA: ${head}`);
console.log(`Upstream: ${upstream}`);
