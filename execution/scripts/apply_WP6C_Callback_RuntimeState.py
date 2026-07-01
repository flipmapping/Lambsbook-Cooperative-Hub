#!/usr/bin/env python3

import os
import sys
import tempfile
from pathlib import Path

EXPECTED_HEAD = "4e12d8b"

TARGET = Path("client/src/pages/HubAuthCallback.tsx")

OLD_CONTINUATION = """await postAuthenticationContinuation(
          continuationContext,
        );"""

NEW_CONTINUATION = """const runtimeState =
          await postAuthenticationContinuation(
            continuationContext,
          );

        const destination =
          resolvePostAuthenticationDestination(
            runtimeState,
          );"""

OLD_NAVIGATION = """setLocation("/hub/dashboard");"""

NEW_NAVIGATION = """setLocation(destination);"""


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

head = os.popen("git rev-parse --short HEAD").read().strip()

if head != EXPECTED_HEAD:
    fail(f"HEAD mismatch ({head})")

text = TARGET.read_text(encoding="utf-8")

count = text.count(OLD_CONTINUATION)

if count != 1:
    fail(
        f"Continuation invocation occurrence = {count} "
        "(expected exactly 1)."
    )

text = text.replace(
    OLD_CONTINUATION,
    NEW_CONTINUATION,
    1,
)

count = text.count(OLD_NAVIGATION)

if count != 1:
    fail(
        f"Navigation occurrence = {count} "
        "(expected exactly 1)."
    )

text = text.replace(
    OLD_NAVIGATION,
    NEW_NAVIGATION,
    1,
)

if text.count("resolvePostAuthenticationDestination(") != 1:
    fail("RuntimeState consumer verification failed.")

atomic_write(TARGET, text)

print("[OK] Callback RuntimeState consumer inserted.")
print("[OK] Navigation now consumes RuntimeState.")
print("[OK] Existing timeout preserved.")
print("[OK] Atomic write complete.")
print()
print("WP6C COMPLETE")
print()
print("Next verification:")
print("  git diff --stat")
print("  npm run build")
print("  npm run dev")