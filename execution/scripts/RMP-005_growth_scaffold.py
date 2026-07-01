#!/usr/bin/env python3

"""
RMP-005
Growth Engine Foundation Scaffold

Repository Mutation Script
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED_MAJOR = 3
EXPECTED_MINOR = 11

REQUIRED_DIRS = [
    "web/src",
    "web/src/app",
    "web/src/lib",
]

FORBIDDEN_EXISTING = [
    "web/src/growth",
    "web/src/lib/growth",
]

DIRECTORIES_TO_CREATE = [
    "web/src/growth",
    "web/src/growth/components",
    "web/src/growth/content",
    "web/src/growth/content/vi",
    "web/src/growth/content/en",
    "web/src/growth/content/zh",
    "web/src/growth/hooks",
    "web/src/growth/registry",
    "web/src/growth/types",

    "web/src/lib/growth",
    "web/src/lib/growth/prospects",
    "web/src/lib/growth/recruitment",
    "web/src/lib/growth/content",
    "web/src/lib/growth/communication",
]

FILES = {
    "web/src/growth/index.ts":
"""/*
 * Growth Engine
 * Repository scaffold.
 */

export {};
""",

    "web/src/lib/growth/index.ts":
"""/*
 * Growth Library
 * Repository scaffold.
 */

export {};
""",
}


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str) -> None:
    print(f"[OK] {message}")


def atomic_write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        "w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:
        tmp.write(content)
        temp_name = tmp.name

    os.replace(temp_name, path)


def verify_python():
    if (
        sys.version_info.major != EXPECTED_MAJOR
        or sys.version_info.minor != EXPECTED_MINOR
    ):
        fail(
            f"Python {EXPECTED_MAJOR}.{EXPECTED_MINOR}.x required "
            f"(found {sys.version})"
        )
    ok("Python version verified")


def verify_repository_root():
    cwd = Path.cwd()

    if not (cwd / ".git").exists():
        fail("Repository root not detected (.git missing)")

    ok(f"Repository root: {cwd}")


def verify_required_dirs():
    for d in REQUIRED_DIRS:
        p = Path(d)
        if not p.exists():
            fail(f"Required anchor missing: {d}")

    ok("Repository anchors verified")


def verify_forbidden():
    for d in FORBIDDEN_EXISTING:
        p = Path(d)
        if p.exists():
            fail(
                f"Mutation already appears applied "
                f"(directory exists): {d}"
            )

    ok("Mutation region is clean")


def create_directories():
    for d in DIRECTORIES_TO_CREATE:
        Path(d).mkdir(parents=True, exist_ok=False)
        print(f"[CREATE] {d}")


def create_files():
    for filename, content in FILES.items():
        atomic_write(Path(filename), content)
        print(f"[WRITE] {filename}")


def main():
    verify_python()
    verify_repository_root()
    verify_required_dirs()
    verify_forbidden()

    create_directories()
    create_files()

    ok("Growth Engine scaffold created")
    ok("RMP-005 COMPLETE")


if __name__ == "__main__":
    main()