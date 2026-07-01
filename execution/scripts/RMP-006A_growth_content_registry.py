#!/usr/bin/env python3
"""
RMP-006A
Growth Content Registry Foundation

Creates the multilingual content placeholder files and registry JSON
defined by the approved RMP-006A work package.

Authoritative Mutation:
    RMP-006A

Execution Standard:
    EXEC-STD-001
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED_PYTHON = (3, 11)

# ----------------------------------------------------------------------
# Repository anchors established by RMP-005
# ----------------------------------------------------------------------

REQUIRED_ANCHORS = [
    "web/src/growth",
    "web/src/growth/content",
    "web/src/growth/content/vi",
    "web/src/growth/content/en",
    "web/src/growth/content/zh",
    "web/src/growth/registry",
]

# ----------------------------------------------------------------------
# Registry files
# ----------------------------------------------------------------------

REGISTRY_FILES = {
    "web/src/growth/registry/assets.json": [],
    "web/src/growth/registry/faq.json": [],
    "web/src/growth/registry/journey.json": [],
    "web/src/growth/registry/navigation.json": [],
    "web/src/growth/registry/programs.json": [],
    "web/src/growth/registry/scholarships.json": [],
}

# ----------------------------------------------------------------------
# Localised placeholder files
# ----------------------------------------------------------------------

CONTENT_FILES = {
    # Vietnamese
    "web/src/growth/content/vi/home.json": {},
    "web/src/growth/content/vi/programs.json": {},
    "web/src/growth/content/vi/scholarships.json": {},
    "web/src/growth/content/vi/admissions.json": {},
    "web/src/growth/content/vi/faq.json": {},
    "web/src/growth/content/vi/navigation.json": {},
    "web/src/growth/content/vi/footer.json": {},

    # English
    "web/src/growth/content/en/home.json": {},
    "web/src/growth/content/en/programs.json": {},
    "web/src/growth/content/en/scholarships.json": {},
    "web/src/growth/content/en/admissions.json": {},
    "web/src/growth/content/en/faq.json": {},
    "web/src/growth/content/en/navigation.json": {},
    "web/src/growth/content/en/footer.json": {},

    # Chinese
    "web/src/growth/content/zh/home.json": {},
    "web/src/growth/content/zh/programs.json": {},
    "web/src/growth/content/zh/scholarships.json": {},
    "web/src/growth/content/zh/admissions.json": {},
    "web/src/growth/content/zh/faq.json": {},
    "web/src/growth/content/zh/navigation.json": {},
    "web/src/growth/content/zh/footer.json": {},
}


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------

def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str) -> None:
    print(f"[OK] {message}")


def atomic_write(path: Path, obj) -> None:
    """
    Atomic JSON write.
    """

    path.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:

        json.dump(
            obj,
            tmp,
            indent=2,
            ensure_ascii=False,
        )

        tmp.write("\n")

        temp_name = tmp.name

    os.replace(temp_name, path)


# ----------------------------------------------------------------------
# Verification
# ----------------------------------------------------------------------

def verify_python():

    if (
        sys.version_info.major,
        sys.version_info.minor,
    ) != EXPECTED_PYTHON:

        fail(
            f"Python {EXPECTED_PYTHON[0]}.{EXPECTED_PYTHON[1]}.x required "
            f"(found {sys.version})"
        )

    ok("Python version verified")


def verify_repository_root():

    cwd = Path.cwd()

    if not (cwd / ".git").exists():
        fail("Repository root not detected (.git missing)")

    ok(f"Repository root: {cwd}")


def verify_anchors():

    for anchor in REQUIRED_ANCHORS:

        if not Path(anchor).exists():
            fail(f"Repository anchor missing: {anchor}")

    ok("Growth scaffold anchors verified")


def verify_target_files_absent():

    for filename in list(REGISTRY_FILES) + list(CONTENT_FILES):

        if Path(filename).exists():
            fail(
                f"Target already exists: {filename}"
            )

    ok("Mutation surface verified")


# ----------------------------------------------------------------------
# Mutation
# ----------------------------------------------------------------------

def create_registry():

    print()

    print("=== Registry Files ===")

    for filename, payload in REGISTRY_FILES.items():

        atomic_write(Path(filename), payload)

        print(f"[CREATE] {filename}")


def create_content():

    print()

    print("=== Multilingual Content ===")

    for filename, payload in CONTENT_FILES.items():

        atomic_write(Path(filename), payload)

        print(f"[CREATE] {filename}")


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------

def main():

    verify_python()

    verify_repository_root()

    verify_anchors()

    verify_target_files_absent()

    create_registry()

    create_content()

    print()

    ok("RMP-006A completed successfully")


if __name__ == "__main__":
    main()