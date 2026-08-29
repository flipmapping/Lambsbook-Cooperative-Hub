const { execFileSync } = require("node:child_process");

const RELEASE_GATE_TIMEOUT_MS = 120000;

process.stdout.write("RELEASE_GATE_START\\n");


function git(args) {
  const operation = `git ${args.join(" ")}`;
  console.log(`RELEASE_GATE_OPERATION=${operation}`);

  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: RELEASE_GATE_TIMEOUT_MS,
    }).trim();
  } catch (error) {
    console.error("RELEASE_GATE=EXECUTION_ERROR");
    console.error(
      "RELEASE_GATE_EXECUTION_ERROR=" +
        JSON.stringify({
          phase: "GIT",
          operation,
          exit_status:
            typeof error.status === "number" ? error.status : null,
          signal: error.signal || null,
          stderr: error.stderr?.toString() || "",
        })
    );
    process.exit(2);
  }
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

function classifyRepositoryPath(path) {
  if (path.startsWith("execution/workspace/")) return "WORKSPACE_EVIDENCE";
  if (path.startsWith("execution/repository-stewardship/")) return "GOVERNANCE_CONTROL_PLANE";
  if (path.startsWith("scripts/runtime-guards/")) return "GOVERNANCE_CONTROL_PLANE";
  if (path.startsWith("client/") || path.startsWith("server/") || path.startsWith("web/")) return "PRODUCT_SURFACE";
  return "UNCLASSIFIED";
}

function buildScopeAlignmentTruth(releaseContract, workCycleManifest) {
  const authorityScope =
    workCycleManifest.certified_mutation_paths || [];

  const authorizedNotInContract = authorityScope
    .filter((path) => !isInReleaseContractScope(path));

  const contractNotAuthorized = [];

  return {
    status:
      authorizedNotInContract.length === 0 &&
      contractNotAuthorized.length === 0
        ? "PASS"
        : "FAIL",
    evidence: {
      mode: "RELEASE_CONTRACT_SCOPE_ADMISSION",
      authorized_not_in_contract: authorizedNotInContract,
      contract_not_authorized: contractNotAuthorized,
    },
  };
}


function buildDeploymentConfigurationTruth(releaseContract) {
  const fs = require("node:fs");

  const path = ".replit";

  if (!fs.existsSync(path)) {
    return {
      status: "FAIL",
      evidence: {
        reason: "REPLIT_CONFIG_MISSING",
      },
    };
  }

  const configuration = releaseContract.deployment_configuration;

  if (!configuration) {
    return {
      status: "FAIL",
      evidence: {
        reason: "DEPLOYMENT_CONFIGURATION_CONTRACT_MISSING",
      },
    };
  }

  const text = fs.readFileSync(path, "utf8");

  const deploymentMatch = text.match(
    /\[deployment\]([\s\S]*?)(?=\n\[[^\n]+\]|\n\[\[[^\n]+\]\]|$)/
  );

  const deployment = deploymentMatch ? deploymentMatch[1] : "";

  const deploymentTarget =
    /(?:^|\n)\s*deploymentTarget\s*=\s*"([^"]+)"/.exec(deployment)?.[1] ??
    null;

  const buildCommandMatch =
    /(?:^|\n)\s*build\s*=\s*\[([^\]]+)\]/.exec(deployment);

  const runCommandMatch =
    /(?:^|\n)\s*run\s*=\s*\[([^\]]+)\]/.exec(deployment);

  const parseCommand = (value) =>
    value
      ? value
          .split(",")
          .map((item) => item.trim().replace(/^"|"$/g, ""))
      : null;

  const buildCommand = parseCommand(buildCommandMatch?.[1]);
  const runCommand = parseCommand(runCommandMatch?.[1]);

  const expectedMappings =
    Array.isArray(configuration.approved_port_mappings) &&
    configuration.approved_port_mappings.length > 0
      ? configuration.approved_port_mappings
      : [configuration.production_port_mapping || {}];

  const portMappings = [];
  const portPattern =
    /\[\[ports\]\]([\s\S]*?)(?=\n\[\[|\n\[[^\n]+\]|$)/g;

  let match;
  while ((match = portPattern.exec(text)) !== null) {
    const block = match[1];

    const localPort =
      /\blocalPort\s*=\s*(\d+)/.exec(block)?.[1] ?? null;

    const externalPort =
      /\bexternalPort\s*=\s*(\d+)/.exec(block)?.[1] ?? null;

    if (localPort !== null || externalPort !== null) {
      portMappings.push({
        localPort,
        externalPort,
      });
    }
  }

  const expectedPortMappings = expectedMappings.map((mapping) => ({
    localPort: String(mapping.local_port),
    externalPort: String(mapping.external_port),
  }));

  const productionMappingsMatchExactly =
    JSON.stringify(portMappings) ===
    JSON.stringify(expectedPortMappings);

  const deploymentEnvPortOverride =
    /\[env\]([\s\S]*?)(?=\n\[[^\n]+\]|\n\[\[[^\n]+\]\]|$)/.exec(text);

  const hasPortOverride =
    deploymentEnvPortOverride !== null &&
    /(?:^|\n)\s*PORT\s*=/.test(deploymentEnvPortOverride[1]);

  const checks = {
    deployment_target:
      deploymentTarget === configuration.deployment_target,

    deployment_build:
      JSON.stringify(buildCommand) ===
      JSON.stringify(configuration.build_command),

    deployment_run:
      JSON.stringify(runCommand) ===
      JSON.stringify(configuration.run_command),

    production_port_mapping:
      productionMappingsMatchExactly,

    deployment_port_override_absent:
      configuration.deployment_port_override?.required_absent === true
        ? !hasPortOverride
        : true,
  };

  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    status: failed.length === 0 ? "PASS" : "FAIL",
    evidence: {
      deployment_target: deploymentTarget,
      deployment_build: buildCommand,
      deployment_run: runCommand,
      production_port_mapping: expectedPortMappings,
      observed_port_mappings: portMappings,
      deployment_port_override_present: hasPortOverride,
      failed_checks: failed,
      authority: configuration.authority,
    },
  };
}

function readCanonicalRuntimeTruth() {
  try {
    const result = execFileSync(
      process.execPath,
      ["scripts/runtime-guards/enforce-canonical-runtime.cjs"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: RELEASE_GATE_TIMEOUT_MS,
      }
    );

    return {
      status: "PASS",
      evidence: {
        guard: "scripts/runtime-guards/enforce-canonical-runtime.cjs",
        output: result.trim(),
      },
    };
  } catch (error) {
    return {
      status: "FAIL",
      evidence: {
        guard: "scripts/runtime-guards/enforce-canonical-runtime.cjs",
        output:
          error.stdout?.toString() ||
          error.stderr?.toString() ||
          "CANONICAL_RUNTIME_GUARD_FAILED",
      },
    };
  }
}

function buildReleaseTruthState() {
  const releaseContractState = readReleaseContract();
  const releaseContract = releaseContractState.contract;
  const workCycleManifest = JSON.parse(
    require("node:fs").readFileSync(
      "execution/repository-stewardship/WORK-CYCLE-AUTHORITY.json",
      "utf8"
    )
  );

  const scopeAlignment = buildScopeAlignmentTruth(
    releaseContract,
    workCycleManifest
  );

  const deploymentConfiguration =
    buildDeploymentConfigurationTruth(releaseContract);

  const compiler = readCompilerTruth();
  const canonicalRuntime = readCanonicalRuntimeTruth();

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
        timeout: RELEASE_GATE_TIMEOUT_MS,
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
      evidence: error.stdout || error.stderr || "WORK_CYCLE_EVALUATOR_FAILED",
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
      id: "WORK_CYCLE_RELEASE_CONTRACT_ALIGNMENT",
      status: scopeAlignment.status,
      evidence: scopeAlignment.evidence,
    },
    {
      id: "WORK_CYCLE_AUTHORITY",
      status: workCycle.status,
      evidence: workCycle.evidence,
    },
    {
      id: "DEPLOYMENT_CONFIGURATION",
      status: deploymentConfiguration.status,
      evidence: deploymentConfiguration.evidence,
    },
    {
      id: "WORKTREE_CLEAN",
      status:
        candidateWorktreeChanges.length === 0 &&
        candidateStagedChanges.length === 0
          ? "PASS"
          : "FAIL",
      evidence: {
        repository_status: status ? "dirty" : "clean",
        candidate_sha: head,
        upstream_sha: upstreamHead,
        candidate_worktree_changes: candidateWorktreeChanges,
        candidate_staged_changes: candidateStagedChanges,
        concurrent_wip_present: Boolean(status),
        release_blocking:
          candidateWorktreeChanges.length > 0 ||
          candidateStagedChanges.length > 0,
        authority: "RELEASE-CANDIDATE-SURFACE",
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
      id: "CANONICAL_RUNTIME",
      status: canonicalRuntime.status,
      evidence: canonicalRuntime.evidence,
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

function isInReleaseContractScope(path) {
  return certifiedChangeScope.some((entry) => {
    if (entry.endsWith("/")) {
      return path.startsWith(entry);
    }
    return path === entry;
  });
}

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
        timeout: RELEASE_GATE_TIMEOUT_MS,
  }
);

const workingTreeChanges = workingTreeRaw
  .split("\n")
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const candidatePaths = [...new Set(committedChanges)];

const candidateWorktreeChanges = workingTreeChanges.filter(
  (filePath) => candidatePaths.includes(filePath)
);

const candidateStagedRaw = execFileSync(
  "git",
  ["diff", "--cached", "--name-only"],
  {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: RELEASE_GATE_TIMEOUT_MS,
  }
);

const candidateStagedChanges = candidateStagedRaw
  .split("\n")
  .map((path) => path.trim())
  .filter(Boolean)
  .filter((filePath) => candidatePaths.includes(filePath));

const changedFiles = candidatePaths;

function isInCertifiedChangeScope(path) {
  return certifiedChangeScope.some((entry) => {
    if (entry.endsWith("/")) {
      return path.startsWith(entry);
    }
    return path === entry;
  });
}

const pathClassifications = changedFiles.map((path) => ({ path, classification: classifyRepositoryPath(path) }));

const outOfScopeChanges = changedFiles.filter(
  (path) =>
    !isInCertifiedChangeScope(path) &&
    !isAllowedRootIngress(path) &&
    !isExcludedRuntimeBoundary(path)
);

const truthState = buildReleaseTruthState();

console.log("PATH_CLASSIFICATIONS="+JSON.stringify(pathClassifications));
console.log("RELEASE TRUTH-STATE TABLE");
console.log("-------------------------");
for (const row of truthState) {
  console.log(`${row.id}: ${row.status}`);
}
console.log("-------------------------");

const failedTruthRows = truthState.filter(
  (row) => row.status !== "PASS"
);
console.log("FAILED_TRUTH_EVIDENCE="+JSON.stringify(failedTruthRows));

if (failedTruthRows.length) {
  fail(
    "RELEASE_TRUTH_STATE_FAILED: " +
      failedTruthRows.map((row) => row.id).join(", ")
  );
}

if (outOfScopeChanges.length) {
  fail(
    "RELEASE_SCOPE_VIOLATION_CLASSIFIED: " +
      outOfScopeChanges.map((path) => classifyRepositoryPath(path) + ":" + path).join(", ")
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
