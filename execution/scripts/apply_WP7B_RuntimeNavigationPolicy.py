#!/usr/bin/env python3

import os
import sys
import tempfile
from pathlib import Path

EXPECTED_HEAD = "4e12d8b"

TARGET = Path(
    "client/src/lib/auth/RuntimeNavigationPolicy.ts"
)

OLD = """export function resolveRuntimeDestination(
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
}"""

NEW = """export function resolveRuntimeDestination(
  runtimeState: RuntimeState,
): string {
  switch (runtimeState.outcome) {
    case "member":
      return "/hub/dashboard";

    case "pending_invitation":
      return "/hub/dashboard";

    case "non_member":
      return "/hub/dashboard";

    case "anonymous":
      return "/hub/dashboard";

    default:
      return "/hub/dashboard";
  }
}"""


def fail(msg):
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

head = os.popen(
    "git rev-parse --short HEAD"
).read().strip()

if head != EXPECTED_HEAD:
    fail(
        f"HEAD mismatch "
        f"(expected {EXPECTED_HEAD}, found {head})."
    )

if not TARGET.exists():
    fail("RuntimeNavigationPolicy.ts not found.")

text = TARGET.read_text(encoding="utf-8")

count = text.count(OLD)

if count != 1:
    fail(
        f"Policy occurrence = {count} "
        "(expected exactly 1)."
    )

text = text.replace(
    OLD,
    NEW,
    1,
)

if text.count('case "member":') != 1:
    fail("Member policy verification failed.")

if text.count('case "pending_invitation":') != 1:
    fail("Pending invitation policy verification failed.")

if text.count('case "non_member":') != 1:
    fail("Non-member policy verification failed.")

if text.count('case "anonymous":') != 1:
    fail("Anonymous policy verification failed.")

atomic_write(TARGET, text)

print("[OK] Runtime navigation policy expanded.")
print("[OK] Explicit outcome routing established.")
print("[OK] Observable navigation unchanged.")
print("[OK] Atomic write complete.")
print()
print("WP7B COMPLETE")
print()
print("Next verification:")
print("  git diff --stat")
print("  npm run build")
print("  npm run dev")