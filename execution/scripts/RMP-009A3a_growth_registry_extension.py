#!/usr/bin/env python3
"""
RMP-009A3a
Growth Runtime Registry Extension

Updates

    web/src/growth/runtime/registry.ts

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

REGISTRY = ROOT / "web/src/growth/runtime/registry.ts"


NEW_SOURCE = """export const REGISTRIES = {
  admissions: "admissions",
  assets: "assets",
  faq: "faq",
  footer: "footer",
  journey: "journey",
  navigation: "navigation",
  programs: "programs",
  scholarships: "scholarships",
} as const;

export type RegistryName =
  keyof typeof REGISTRIES;

export function isRegistryName(
  value: string
): value is RegistryName {

  return value in REGISTRIES;

}

export function getRegistryNames(): RegistryName[] {

  return Object.keys(
    REGISTRIES
  ) as RegistryName[];

}
"""


def fail(msg: str):
    print(f"[FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"[OK] {msg}")


def atomic_write(path: Path, text: str):
    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:
        tmp.write(text.rstrip() + "\n")
        name = tmp.name

    os.replace(name, path)


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

if not REGISTRY.exists():
    fail("Missing repository anchor: web/src/growth/runtime/registry.ts")

ok("Repository anchor verified")

baseline = REGISTRY.read_text(encoding="utf-8")

required = [
    'assets: "assets"',
    'faq: "faq"',
    'journey: "journey"',
    'navigation: "navigation"',
    'programs: "programs"',
    'scholarships: "scholarships"',
]

for token in required:
    if token not in baseline:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if 'admissions: "admissions"' in baseline:
    fail("Admissions registry already present")

if 'footer: "footer"' in baseline:
    fail("Footer registry already present")

ok("Mutation surface verified")

print()
print("=== Extending Runtime Registry ===")

atomic_write(REGISTRY, NEW_SOURCE)

print("[UPDATE] web/src/growth/runtime/registry.ts")

print()

ok("Growth runtime registry extended")
ok("RMP-009A3a COMPLETE")