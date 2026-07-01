#!/usr/bin/env python3
"""
RMP-006B
Growth Content Schema Initialization

Authoritative Mutation:
    RMP-006B

Purpose:
    Upgrade the placeholder JSON files created by RMP-006A into
    canonical versioned schema documents.

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

REPOSITORY_ANCHORS = [
    "web/src/growth",
    "web/src/growth/content",
    "web/src/growth/registry",
]

REGISTRY_FILES = [
    "web/src/growth/registry/assets.json",
    "web/src/growth/registry/faq.json",
    "web/src/growth/registry/journey.json",
    "web/src/growth/registry/navigation.json",
    "web/src/growth/registry/programs.json",
    "web/src/growth/registry/scholarships.json",
]

CONTENT_FILES = {
    "web/src/growth/content/vi/home.json": "vi",
    "web/src/growth/content/vi/programs.json": "vi",
    "web/src/growth/content/vi/scholarships.json": "vi",
    "web/src/growth/content/vi/admissions.json": "vi",
    "web/src/growth/content/vi/faq.json": "vi",
    "web/src/growth/content/vi/navigation.json": "vi",
    "web/src/growth/content/vi/footer.json": "vi",

    "web/src/growth/content/en/home.json": "en",
    "web/src/growth/content/en/programs.json": "en",
    "web/src/growth/content/en/scholarships.json": "en",
    "web/src/growth/content/en/admissions.json": "en",
    "web/src/growth/content/en/faq.json": "en",
    "web/src/growth/content/en/navigation.json": "en",
    "web/src/growth/content/en/footer.json": "en",

    "web/src/growth/content/zh/home.json": "zh",
    "web/src/growth/content/zh/programs.json": "zh",
    "web/src/growth/content/zh/scholarships.json": "zh",
    "web/src/growth/content/zh/admissions.json": "zh",
    "web/src/growth/content/zh/faq.json": "zh",
    "web/src/growth/content/zh/navigation.json": "zh",
    "web/src/growth/content/zh/footer.json": "zh",
}


def fail(message: str):
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str):
    print(f"[OK] {message}")


def atomic_write(path: Path, obj):

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

        temp = tmp.name

    os.replace(temp, path)


# ----------------------------------------------------
# Verification
# ----------------------------------------------------

def verify_python():

    if (
        sys.version_info.major,
        sys.version_info.minor,
    ) != EXPECTED_PYTHON:

        fail(
            f"Python {EXPECTED_PYTHON[0]}.{EXPECTED_PYTHON[1]} required "
            f"(found {sys.version.split()[0]})"
        )

    ok("Python version verified")


def verify_repository():

    root = Path.cwd()

    if not (root / ".git").exists():
        fail("Repository root not detected")

    ok(f"Repository root: {root}")


def verify_anchors():

    for anchor in REPOSITORY_ANCHORS:

        if not Path(anchor).exists():
            fail(f"Missing repository anchor: {anchor}")

    ok("Repository anchors verified")


def verify_files():

    print()

    print("=== Verifying Registry Files ===")

    for filename in REGISTRY_FILES:

        path = Path(filename)

        if not path.exists():
            fail(f"Missing registry file: {filename}")

        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as ex:
            fail(f"Invalid JSON: {filename} ({ex})")

        print(f"[OK] {filename}")

    print()

    print("=== Verifying Content Files ===")

    for filename in CONTENT_FILES:

        path = Path(filename)

        if not path.exists():
            fail(f"Missing content file: {filename}")

        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as ex:
            fail(f"Invalid JSON: {filename} ({ex})")

        print(f"[OK] {filename}")

    ok("Mutation surface verified")


# ----------------------------------------------------
# Mutation
# ----------------------------------------------------

def update_registry():

    print()

    print("=== Updating Registry ===")

    payload = {
        "version": "1.0",
        "items": []
    }

    for filename in REGISTRY_FILES:

        atomic_write(Path(filename), payload)

        print(f"[WRITE] {filename}")


def update_content():

    print()

    print("=== Updating Content ===")

    for filename, locale in CONTENT_FILES.items():

        payload = {
            "version": "1.0",
            "locale": locale,
            "sections": {}
        }

        atomic_write(Path(filename), payload)

        print(f"[WRITE] {filename}")


# ----------------------------------------------------
# Main
# ----------------------------------------------------

def main():

    verify_python()

    verify_repository()

    verify_anchors()

    verify_files()

    update_registry()

    update_content()

    print()

    ok("Growth content schema initialized")

    ok("RMP-006B COMPLETE")


if __name__ == "__main__":
    main()