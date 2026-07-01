#!/usr/bin/env python3
"""
apply_WP5D_HubAuth.py

WP5D — Delegation Activation
Repository Mutation Script (HubAuth only)

Authoritative Scope:
    client/src/pages/HubAuth.tsx

This script:

1. Verifies Python 3.11.x
2. Verifies repository root
3. Verifies target file exists
4. Verifies expected repository anchors
5. Inserts the canonical continuation invocation into BOTH
   successful authentication branches.
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
    raise SystemExit("ERROR: Current directory is not repository root.")

TARGET = ROOT / "client/src/pages/HubAuth.tsx"

if not TARGET.exists():
    raise SystemExit(f"ERROR: Missing file: {TARGET}")

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

session_anchor = """localStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(result.session),
          );"""

session_anchor2 = """localStorage.setItem(
          "supabase.auth.token",
          JSON.stringify(result.session),
        );"""

if text.count(session_anchor) != 1:
    raise SystemExit(
        "ERROR: Signup session anchor missing or duplicated."
    )

if text.count(session_anchor2) != 1:
    raise SystemExit(
        "ERROR: Login session anchor missing or duplicated."
    )

if text.count("await postAuthenticationContinuation("):
    raise SystemExit(
        "ERROR: Continuation already activated."
    )

signup_insert = session_anchor + """

          const prepared =
            _prepareContinuationValues({
              accessToken: result.session.access_token,
              refreshToken:
                result.session.refresh_token,
              inviteToken:
                localStorage.getItem(
                  "gateway.invite.token",
                ) ?? undefined,
            });

          const continuationContext =
            _buildContinuationContext(
              prepared,
              mode,
            );

          await postAuthenticationContinuation(
            continuationContext,
          );
"""

login_insert = session_anchor2 + """

        const prepared =
          _prepareContinuationValues({
            accessToken: result.session.access_token,
            refreshToken:
              result.session.refresh_token,
            inviteToken:
              localStorage.getItem(
                "gateway.invite.token",
              ) ?? undefined,
          });

        const continuationContext =
          _buildContinuationContext(
            prepared,
            mode,
          );

        await postAuthenticationContinuation(
          continuationContext,
        );
"""

updated = text.replace(session_anchor, signup_insert, 1)
updated = updated.replace(session_anchor2, login_insert, 1)

if updated == text:
    raise SystemExit("ERROR: No mutation performed.")

with NamedTemporaryFile(
    "w",
    delete=False,
    encoding="utf-8",
    dir=str(TARGET.parent),
) as tmp:
    tmp.write(updated)
    temp_name = tmp.name

os.replace(temp_name, TARGET)

print("[OK] HubAuth continuation activation inserted.")
print("[OK] Signup success path updated.")
print("[OK] Login success path updated.")
print("[OK] Atomic write complete.")
print()
print("Next:")
print("  1. Execute apply_WP5D_Callback.py")
print("  2. git diff --stat")
print("  3. git diff")
print("  4. npm run build")
print("  5. npm run dev")