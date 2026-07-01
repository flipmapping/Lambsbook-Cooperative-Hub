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

if count != 1:
    fail(
        f"Expected exactly one remaining continuation block "
        f"(found {count})."
    )

count_new = text.count(NEW)

if count_new != 1:
    fail(
        f"Expected exactly one RuntimeState consumer already present "
        f"(found {count_new})."
    )

text = text.replace(
    OLD,
    NEW,
    1,
)

if text.count(OLD) != 0:
    fail("Legacy continuation blocks still remain.")

if text.count(NEW) != 2:
    fail(
        "Expected exactly two RuntimeState consumers after mutation."
    )

atomic_write(TARGET, text)

print("[OK] Login continuation now consumes RuntimeState.")
print("[OK] HubAuth now contains two RuntimeState consumers.")
print("[OK] No legacy continuation blocks remain.")
print("[OK] Atomic write complete.")
print()
print("Next:")
print("  git diff --stat")
print("  npm run build")
print("  npm run dev")