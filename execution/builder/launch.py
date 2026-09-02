#!/usr/bin/env python3

from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: launch.py <path-to-cib>", file=sys.stderr)
        return 2

    cib = Path(sys.argv[1])

    if not cib.is_absolute():
        cib = ROOT / cib

    cib = cib.resolve()

    try:
        cib.relative_to(ROOT)
    except ValueError:
        print("CIB must reside within the repository root.", file=sys.stderr)
        return 2

    if not cib.is_file():
        print(f"CIB not found: {cib}", file=sys.stderr)
        return 2

    return subprocess.call(
        [
            sys.executable,
            "-m",
            "execution.builders.build_claude_package",
            str(cib.relative_to(ROOT)),
        ],
        cwd=ROOT,
    )


if __name__ == "__main__":
    raise SystemExit(main())
