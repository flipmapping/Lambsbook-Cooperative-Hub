#!/usr/bin/env python3

import os
import sys
import tempfile
from pathlib import Path

EXPECTED_HEAD = "4e12d8b"

TARGET = Path(
    "client/src/lib/auth/NavigationConsumptionAuthority.ts"
)

IMPORT_ANCHOR = 'import type { RuntimeState } from "./PostAuthenticationContinuation";'

OLD_FUNCTION = """export function resolvePostAuthenticationDestination(
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

NEW_FUNCTION = """export function resolvePostAuthenticationDestination(
  runtimeState: RuntimeState,
): string {
  return resolveRuntimeDestination(runtimeState);
}"""

NEW_IMPORT = (
    'import { resolveRuntimeDestination } '
    'from "./RuntimeNavigationPolicy";'
)


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
    fail("NavigationConsumptionAuthority.ts not found.")

text = TARGET.read_text(encoding="utf-8")

if "resolveRuntimeDestination" in text:
    fail("Delegation already present.")

count = text.count(IMPORT_ANCHOR)

if count != 1:
    fail(
        f"Import anchor occurrence = {count} "
        "(expected exactly 1)."
    )

text = text.replace(
    IMPORT_ANCHOR,
    IMPORT_ANCHOR + "\n" + NEW_IMPORT,
    1,
)

count = text.count(OLD_FUNCTION)

if count != 1:
    fail(
        f"Function occurrence = {count} "
        "(expected exactly 1)."
    )

text = text.replace(
    OLD_FUNCTION,
    NEW_FUNCTION,
    1,
)

if text.count("resolveRuntimeDestination(runtimeState)") != 1:
    fail("Delegation verification failed.")

atomic_write(TARGET, text)

print("[OK] NavigationConsumptionAuthority now delegates.")
print("[OK] RuntimeNavigationPolicy is canonical owner.")
print("[OK] Atomic write complete.")
print()
print("WP7A COMPLETE")
print()
print("Next verification:")
print("  git diff --stat")
print("  npm run build")
print("  npm run dev")