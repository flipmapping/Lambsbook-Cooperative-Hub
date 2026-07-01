#!/usr/bin/env python3

import os
import sys
import tempfile
from pathlib import Path

EXPECTED_HEAD = "4e12d8b"

TARGET = Path(
    "client/src/lib/auth/RuntimeNavigationPolicy.ts"
)

CONTENT = """import type { RuntimeState } from "./PostAuthenticationContinuation";

/**
 * ============================================================================
 * Runtime Navigation Policy
 * ============================================================================
 *
 * Architectural Role:
 *   Canonical owner of RuntimeState → destination mapping.
 *
 * Governance:
 *   - Pure navigation policy.
 *   - No authentication.
 *   - No continuation orchestration.
 *   - No business mutation.
 */

export function resolveRuntimeDestination(
  runtimeState: RuntimeState,
): string {
  switch (runtimeState.outcome) {
    case "member":
    case "pending_invitation":
    case "non_member":
    case "anonymous":
    default:
      return "/hub/dashboard";
  }
}
"""


def fail(msg: str):
    print(f"ERROR: {msg}")
    sys.exit(1)


def atomic_write(path: Path, text: str):
    fd, tmp = tempfile.mkstemp(dir=str(path.parent))
    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    os.replace(tmp, path)


if sys.version_info[:2] != (3, 11):
    fail("Python 3.11.x required.")

if not Path(".git").exists():
    fail("Repository root not found.")

head = os.popen("git rev-parse --short HEAD").read().strip()

if head != EXPECTED_HEAD:
    fail(
        f"HEAD mismatch "
        f"(expected {EXPECTED_HEAD}, found {head})."
    )

if not TARGET.exists():
    fail("RuntimeNavigationPolicy.ts does not exist.")

size = TARGET.stat().st_size

if size != 0:
    fail(
        f"Expected empty placeholder file; found {size} bytes."
    )

atomic_write(TARGET, CONTENT)

print("[OK] RuntimeNavigationPolicy populated.")
print("[OK] Empty placeholder replaced.")
print("[OK] Atomic write complete.")
print()
print("Next:")
print("  git diff --stat")
print("  /home/runner/workspace/.pythonlibs/bin/python3 "
      "execution/scripts/apply_WP7A_NavigationAuthority.py")