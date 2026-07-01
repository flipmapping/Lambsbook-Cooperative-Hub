#!/usr/bin/env python3

import os
import sys
import tempfile
from pathlib import Path

EXPECTED_HEAD = "4e12d8b"

TARGET = Path("client/src/pages/HubAuth.tsx")

OLD = """await postAuthenticationContinuation(
continuationContext,
);

setLocation("/hub/dashboard");"""

NEW = """const runtimeState =
await postAuthenticationContinuation(
continuationContext,
);

const destination =
resolvePostAuthenticationDestination(
runtimeState,
);

setLocation(destination);"""


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

count = text.count(OLD)

if count != 2:
    fail(
        f"Expected exactly 2 continuation blocks before signup mutation "
        f"(found {count})."
    )

text = text.replace(
    OLD,
    NEW,
    1,
)

remaining = text.count(OLD)

if remaining != 1:
    fail(
        f"Expected exactly 1 continuation block remaining "
        f"(found {remaining})."
    )

atomic_write(TARGET, text)

print("[OK] Signup continuation now consumes RuntimeState.")
print("[OK] One continuation block remains (login).")
print("[OK] Atomic write complete.")
print()
print("Next:")
print("  git diff --stat")
print("  /home/runner/workspace/.pythonlibs/bin/python3 "
      "execution/scripts/apply_WP6C_HubAuth_Login.py")