#!/usr/bin/env python3
"""
RMP-008A3
Hero Strong Typing

Updates

    web/src/growth/components/Hero/Hero.tsx

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

HERO_FILE = ROOT / "web/src/growth/components/Hero/Hero.tsx"


def fail(message: str):
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str):
    print(f"[OK] {message}")


def atomic_write(path: Path, text: str):
    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:
        tmp.write(text)
        tmp_name = tmp.name

    os.replace(tmp_name, path)


#
# Verification
#

if sys.version_info[:2] != EXPECTED:
    fail(
        f"Python {EXPECTED[0]}.{EXPECTED[1]} required "
        f"(found {sys.version.split()[0]})"
    )

ok("Python version verified")

if not (ROOT / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {ROOT}")

if not HERO_FILE.exists():
    fail("Missing repository anchor: web/src/growth/components/Hero/Hero.tsx")

ok("Repository anchor verified")

source = HERO_FILE.read_text(encoding="utf-8")

required = [
    'import { useContent } from "../../hooks/useContent";',
    'const document = useContent("home");',
    '(document.sections as Record<string, any>).hero',
]

for token in required:
    if token not in source:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if "HomeContentDocument" in source:
    fail("Hero typing already appears applied")

ok("Mutation surface verified")

print()
print("=== Updating Hero Typing ===")

#
# 1. Add type import
#

source = source.replace(
    'import { useContent } from "../../hooks/useContent";',
    'import { useContent } from "../../hooks/useContent";\n'
    'import type { HomeContentDocument } from "../../types/content";',
    1,
)

#
# 2. Strongly type document
#

source = source.replace(
    'const document = useContent("home");',
    'const document =\n'
    '    useContent("home") as HomeContentDocument;',
    1,
)

#
# 3. Remove any-cast
#

source = source.replace(
    '(document.sections as Record<string, any>).hero',
    'document.sections.hero',
    1,
)

atomic_write(HERO_FILE, source)

print("[UPDATE] web/src/growth/components/Hero/Hero.tsx")

print()

ok("Hero strong typing applied")
ok("RMP-008A3 COMPLETE")