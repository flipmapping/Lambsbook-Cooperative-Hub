#!/usr/bin/env python3

import os
import sys
import tempfile
from pathlib import Path

EXPECTED_HEAD = "4e12d8b"

TARGET = Path("client/src/pages/HubAuth.tsx")

CONTINUATION_IMPORT = """import {
postAuthenticationContinuation,
type ContinuationContext,
} from "@/lib/auth/PostAuthenticationContinuation";"""

NAV_IMPORT = (
    'import { resolvePostAuthenticationDestination } '
    'from "@/lib/auth/NavigationConsumptionAuthority";'
)


def fail(msg: str):
    print(f"ERROR: {msg}")
    sys.exit(1)


def verify():
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
        fail(f"{TARGET} not found.")


def atomic_write(path: Path, text: str):
    fd, tmp = tempfile.mkstemp(dir=str(path.parent))

    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)

    os.replace(tmp, path)


verify()

text = TARGET.read_text(encoding="utf-8")

if NAV_IMPORT in text:
    fail("NavigationConsumptionAuthority import already exists.")

count = text.count(CONTINUATION_IMPORT)

if count != 1:
    fail(
        f"Continuation import occurrence = {count} "
        "(expected exactly 1)."
    )

replacement = CONTINUATION_IMPORT + "\n" + NAV_IMPORT

text = text.replace(
    CONTINUATION_IMPORT,
    replacement,
    1,
)

atomic_write(TARGET, text)

print("[OK] NavigationConsumptionAuthority import inserted.")
print("[OK] Atomic write complete.")
print()
print("Next:")
print("  git diff --stat")
print("  /home/runner/workspace/.pythonlibs/bin/python3 "
      "execution/scripts/apply_WP6C_HubAuth_Signup.py")