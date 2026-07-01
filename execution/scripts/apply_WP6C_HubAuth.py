#!/usr/bin/env python3

import os
import re
import sys
import tempfile
from pathlib import Path

EXPECTED_HEAD = "4e12d8b"
TARGET = Path("client/src/pages/HubAuth.tsx")


def fail(msg: str):
    print(f"ERROR: {msg}")
    sys.exit(1)


def atomic_write(path: Path, text: str):
    fd, tmp = tempfile.mkstemp(dir=str(path.parent))
    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    os.replace(tmp, path)


def verify():
    if sys.version_info[:2] != (3, 11):
        fail("Python 3.11.x required.")

    if not Path(".git").exists():
        fail("Repository root not found.")

    head = os.popen("git rev-parse --short HEAD").read().strip()
    if head != EXPECTED_HEAD:
        fail(f"HEAD mismatch (expected {EXPECTED_HEAD}, found {head}).")

    if not TARGET.exists():
        fail(f"{TARGET} not found.")


verify()

text = TARGET.read_text(encoding="utf-8")

# ---------------------------------------------------------------------
# Import
# ---------------------------------------------------------------------

import_stmt = (
    'import { resolvePostAuthenticationDestination } '
    'from "@/lib/auth/NavigationConsumptionAuthority";'
)

if import_stmt not in text:
    anchor = '} from "@/lib/auth/PostAuthenticationContinuation";'

    if text.count(anchor) != 1:
        fail("Continuation import anchor mismatch.")

    text = text.replace(
        anchor,
        anchor + "\n" + import_stmt,
        1,
    )

# ---------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------

replacement = """const runtimeState =
            await postAuthenticationContinuation(
              continuationContext,
            );

            const destination =
              resolvePostAuthenticationDestination(
                runtimeState,
              );

            setLocation(destination);"""

old = """await postAuthenticationContinuation(
              continuationContext,
            );

            setLocation("/hub/dashboard");"""

# ---------------------------------------------------------------------
# Signup block
# ---------------------------------------------------------------------

signup_anchor = 'if (mode === "signup") {'
signup_pos = text.find(signup_anchor)

if signup_pos == -1:
    fail("Signup anchor not found.")

signup_end = text.find("return;", signup_pos)

if signup_end == -1:
    fail("Signup return not found.")

signup_region = text[signup_pos:signup_end]

if signup_region.count(old) != 1:
    fail(
        f"Signup continuation occurrence = "
        f"{signup_region.count(old)} (expected 1)."
    )

signup_region = signup_region.replace(old, replacement, 1)

text = (
    text[:signup_pos]
    + signup_region
    + text[signup_end:]
)

# ---------------------------------------------------------------------
# Login block
# ---------------------------------------------------------------------

login_anchor = 'if (result.session) {'
login_pos = text.find(login_anchor, signup_end)

if login_pos == -1:
    fail("Login anchor not found.")

login_end = text.find("}", login_pos)

if login_end == -1:
    fail("Login block end not found.")

login_region = text[login_pos:login_end]

if login_region.count(old) != 1:
    fail(
        f"Login continuation occurrence = "
        f"{login_region.count(old)} (expected 1)."
    )

login_region = login_region.replace(old, replacement, 1)

text = (
    text[:login_pos]
    + login_region
    + text[login_end:]
)

atomic_write(TARGET, text)

print("[OK] NavigationConsumptionAuthority import inserted.")
print("[OK] Signup navigation consumer inserted.")
print("[OK] Login navigation consumer inserted.")
print("[OK] Atomic write complete.")
print()
print("Next:")
print("  git diff --stat")
print("  npm run build")