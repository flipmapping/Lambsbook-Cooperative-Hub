#!/usr/bin/env python3

import os
import re
import sys
import subprocess
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED_COMMIT = "4e12d8b"

ROOT_FILES = [
    "package.json",
    "client/src/pages/HubAuth.tsx",
    "client/src/pages/HubAuthCallback.tsx",
]

HUBAUTH = Path("client/src/pages/HubAuth.tsx")
CALLBACK = Path("client/src/pages/HubAuthCallback.tsx")


def fail(msg: str) -> None:
    print(f"[FAIL] {msg}", file=sys.stderr)
    sys.exit(1)


def verify_python():
    if sys.version_info.major != 3 or sys.version_info.minor != 11:
        fail(f"Python 3.11 required. Found {sys.version}")


def verify_repo():
    for f in ROOT_FILES:
        if not Path(f).exists():
            fail(f"Repository root verification failed. Missing: {f}")

    try:
        head = (
            subprocess.check_output(
                ["git", "rev-parse", "--short", "HEAD"],
                text=True,
            )
            .strip()
        )
    except Exception as e:
        fail(f"Unable to determine git HEAD: {e}")

    if head != EXPECTED_COMMIT:
        fail(f"Expected HEAD {EXPECTED_COMMIT}, found {head}")


def replace_once(text: str, old: str, new: str, description: str) -> str:
    count = text.count(old)
    if count != 1:
        fail(f"{description}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


def atomic_write(path: Path, text: str):
    with NamedTemporaryFile(
        "w",
        delete=False,
        encoding="utf-8",
        dir=str(path.parent),
    ) as tmp:
        tmp.write(text)
        tmp_name = tmp.name
    os.replace(tmp_name, path)


verify_python()
verify_repo()

#
# ------------------------------------------------------------------
# HubAuth.tsx
# ------------------------------------------------------------------
#

hub = HUBAUTH.read_text(encoding="utf-8")

if "postAuthenticationContinuation" not in hub:
    anchor = (
        'import type { ContinuationContext } '
        'from "@/lib/auth/PostAuthenticationContinuation";'
    )

    replacement = (
        'import {\n'
        '  postAuthenticationContinuation,\n'
        '  type ContinuationContext,\n'
        '} from "@/lib/auth/PostAuthenticationContinuation";'
    )

    hub = replace_once(
        hub,
        anchor,
        replacement,
        "HubAuth import",
    )

old_function = """function _buildContinuationContext(
  _prepared: Record<string, unknown>,
): ContinuationContext {
  throw new Error(
    "Not implemented: Canonical ContinuationContext mapping remains dormant.",
  );
}"""

new_function = """function _buildContinuationContext(
  prepared: _PreparedAuthenticationValues,
  authenticationMode: AuthenticationMode,
): ContinuationContext {
  return {
    accessToken: prepared.accessToken,
    refreshToken: prepared.refreshToken,
    inviteToken: prepared.inviteToken,
    authenticationMode,
  };
}"""

hub = replace_once(
    hub,
    old_function,
    new_function,
    "HubAuth continuation builder",
)

print("[OK] HubAuth scaffolding updated.")

#
# ------------------------------------------------------------------
# HubAuthCallback.tsx
# ------------------------------------------------------------------
#

callback = CALLBACK.read_text(encoding="utf-8")

if "postAuthenticationContinuation" not in callback:
    anchor = (
        'import type { ContinuationContext } '
        'from "@/lib/auth/PostAuthenticationContinuation";'
    )

    replacement = (
        'import {\n'
        '  postAuthenticationContinuation,\n'
        '  type ContinuationContext,\n'
        '} from "@/lib/auth/PostAuthenticationContinuation";'
    )

    callback = replace_once(
        callback,
        anchor,
        replacement,
        "Callback import",
    )

anchor = """function _prepareContinuationValues(
  values: _PreparedAuthenticationValues,
): _PreparedAuthenticationValues {
  return values;
}
"""

if "_buildContinuationContext(" not in callback:
    callback = replace_once(
        callback,
        anchor,
        anchor
        + """
function _buildContinuationContext(
  prepared: _PreparedAuthenticationValues,
): ContinuationContext {
  return {
    accessToken: prepared.accessToken,
    refreshToken: prepared.refreshToken,
    inviteToken: prepared.inviteToken,
    authenticationMode: "callback",
  };
}

""",
        "Callback builder insertion",
    )

atomic_write(HUBAUTH, hub)
atomic_write(CALLBACK, callback)

print()
print("WP5C mutation specification applied successfully.")
print("No runtime behaviour was modified.")
print("No navigation logic was modified.")
print("No continuation invocation has been inserted.")
print("Only the approved scaffolding mutation was applied.")