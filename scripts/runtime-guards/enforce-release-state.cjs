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

const status = git(["status", "--porcelain"]);
if (status) fail("worktree is not clean");

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
