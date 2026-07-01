#!/usr/bin/env python3
"""
RMP-008A1
Growth Content Schema Foundation

Updates

    web/src/growth/types/content.ts

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

CONTENT_TYPES = ROOT / "web/src/growth/types/content.ts"

TARGET = """import type { GrowthLocale } from "./locale";

export interface HeroSection {

  title: string;

  subtitle?: string;

  description?: string;

  primaryAction?: string;

  secondaryAction?: string;

}

export interface HomeSections {

  hero?: HeroSection;

  [key: string]: unknown;

}

export interface ContentDocument {

  version: string;

  locale: GrowthLocale;

  sections: Record<string, unknown>;

}

export interface HomeContentDocument
  extends Omit<ContentDocument, "sections"> {

  sections: HomeSections;

}
"""


def fail(message: str):
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str):
    print(f"[OK] {message}")


def atomic_write(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:

        tmp.write(text.rstrip() + "\n")
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

if not CONTENT_TYPES.exists():
    fail("Missing repository anchor: web/src/growth/types/content.ts")

ok("Repository anchor verified")

baseline = CONTENT_TYPES.read_text(encoding="utf-8")

required = [
    "export interface ContentDocument",
    "sections: Record<string, unknown>;",
]

for token in required:
    if token not in baseline:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if "export interface HeroSection" in baseline:
    fail("Growth content schema already appears applied")

ok("Mutation surface verified")

print()
print("=== Updating Growth Content Types ===")

atomic_write(CONTENT_TYPES, TARGET)

print("[UPDATE] web/src/growth/types/content.ts")

print()

ok("Growth content schema created")
ok("RMP-008A1 COMPLETE")