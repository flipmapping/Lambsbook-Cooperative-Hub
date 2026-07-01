#!/usr/bin/env python3

import os
import sys
import tempfile
from pathlib import Path

EXPECTED_PYTHON = (3, 11)
EXPECTED_HEAD = "4e12d8b"

TARGET = Path(
    "client/src/lib/auth/NavigationConsumptionAuthority.ts"
)


FILE_CONTENT = """import type { RuntimeState } from "./PostAuthenticationContinuation";

/**
 * ============================================================================
 * Navigation Consumption Authority
 * ============================================================================
 *
 * Architectural Role:
 *   Sole consumer of RuntimeState for authentication completion.
 *
 * Governance:
 *   - Consumes RuntimeState only.
 *   - Performs no business resolution.
 *   - Performs no membership resolution.
 *   - Performs no invitation resolution.
 *   - Preserves current observable navigation behaviour.
 */

export function resolvePostAuthenticationDestination(
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
}
"""


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    sys.exit(1)


def verify_python():
    if sys.version_info[:2] != EXPECTED_PYTHON:
        fail(
            f"Python {EXPECTED_PYTHON[0]}.{EXPECTED_PYTHON[1]} required "
            f"(found {sys.version.split()[0]})."
        )


def verify_repository():
    if not Path(".git").exists():
        fail("Repository root not found (.git missing).")


def verify_head():
    head = os.popen("git rev-parse --short HEAD").read().strip()

    if head != EXPECTED_HEAD:
        fail(
            f"Repository HEAD mismatch "
            f"(expected {EXPECTED_HEAD}, found {head})."
        )


def atomic_write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)

    fd, tmp = tempfile.mkstemp(
        prefix=path.name,
        dir=str(path.parent),
    )

    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)

    os.replace(tmp, path)


def main():
    verify_python()
    verify_repository()
    verify_head()

    if TARGET.exists():
        fail(
            f"{TARGET} already exists. "
            "WP6C Navigation Authority appears already applied."
        )

    atomic_write(TARGET, FILE_CONTENT)

    print("[OK] NavigationConsumptionAuthority created.")
    print("[OK] Atomic write complete.")
    print()
    print("Next:")
    print("  1. Execute apply_WP6C_HubAuth.py")
    print("  2. git diff --stat")
    print("  3. npm run build")


if __name__ == "__main__":
    main()