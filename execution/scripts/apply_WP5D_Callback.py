#!/usr/bin/env python3
"""
apply_WP5D_Callback.py

WP5D — Delegation Activation
Repository Mutation Script (HubAuthCallback only)

Authoritative Scope:
    client/src/pages/HubAuthCallback.tsx

This script:

1. Verifies Python 3.11.x
2. Verifies repository root
3. Verifies target file exists
4. Verifies expected repository anchors
5. Inserts the canonical continuation invocation into the
   authentication callback success path.
6. Performs an atomic write.
7. Exits non-zero on any verification failure.

This script does NOT:
    - commit
    - push
    - merge
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED_PYTHON = (3, 11)

if sys.version_info[:2] != EXPECTED_PYTHON:
    raise SystemExit(
        f"ERROR: Python {EXPECTED_PYTHON[0]}.{EXPECTED_PYTHON[1]} required "
        f"(found {sys.version.split()[0]})."
    )

ROOT = Path.cwd()

if not (ROOT / ".git").exists():
    raise SystemExit(
        "ERROR: Current directory is not repository root."
    )

TARGET = ROOT / "client/src/pages/HubAuthCallback.tsx"

if not TARGET.exists():
    raise SystemExit(
        f"ERROR: Missing file: {TARGET}"
    )

text = TARGET.read_text(encoding="utf-8")

# ------------------------------------------------------------------
# Repository verification
# ------------------------------------------------------------------

required_unique = [
    "function _buildContinuationContext(",
    "function _prepareContinuationValues(",
    "postAuthenticationContinuation,",
]

for anchor in required_unique:
    count = text.count(anchor)
    if count != 1:
        raise SystemExit(
            f"ERROR: Expected unique anchor '{anchor}' "
            f"(found {count})."
        )

if text.count("await postAuthenticationContinuation("):
    raise SystemExit(
        "ERROR: Continuation already activated."
    )

session_anchor = """        localStorage.setItem("supabase.auth.token", JSON.stringify(tokenData));"""

if text.count(session_anchor) != 1:
    raise SystemExit(
        "ERROR: Session persistence anchor missing or duplicated."
    )

replacement = session_anchor + """

        const prepared =
          _prepareContinuationValues({
            accessToken,
            refreshToken:
              refreshToken ?? undefined,
            inviteToken:
              inviteToken ?? undefined,
          });

        const continuationContext =
          _buildContinuationContext(
            prepared,
          );

        await postAuthenticationContinuation(
          continuationContext,
        );
"""

updated = text.replace(
    session_anchor,
    replacement,
    1,
)

if updated == text:
    raise SystemExit(
        "ERROR: No mutation performed."
    )

with NamedTemporaryFile(
    "w",
    encoding="utf-8",
    delete=False,
    dir=str(TARGET.parent),
) as tmp:
    tmp.write(updated)
    temp_name = tmp.name

os.replace(temp_name, TARGET)

print("[OK] HubAuthCallback continuation activation inserted.")
print("[OK] Callback success path updated.")
print("[OK] Atomic write complete.")
print()
print("Next verification:")
print("  git diff --stat")
print("  git diff")
print("  npm run build")
print("  npm run dev")