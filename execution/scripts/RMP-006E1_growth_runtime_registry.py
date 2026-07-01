#!/usr/bin/env python3
"""
RMP-006E1
Growth Runtime Registry

Bounded Mutation

Modifies ONLY:

    web/src/growth/runtime/registry.ts

No other repository files are modified.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

TARGET = Path("web/src/growth/runtime/registry.ts")

SOURCE = """export const REGISTRIES = {
  assets: "assets",
  faq: "faq",
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

repo = Path.cwd()

if not (repo / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {repo}")

anchors = [
    Path("web/src/growth/runtime"),
    TARGET,
]

for anchor in anchors:
    if not anchor.exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

existing = TARGET.read_text(encoding="utf-8")

if "export const REGISTRIES" not in existing:
    fail("Unexpected registry implementation")

if "getRegistryNames" in existing:
    fail("Mutation appears already applied")

ok("Mutation surface verified")

print()
print("=== Updating Runtime Registry ===")

atomic_write(TARGET, SOURCE)

print(f"[UPDATE] {TARGET}")

print()

ok("Growth runtime registry updated")
ok("RMP-006E1 COMPLETE")