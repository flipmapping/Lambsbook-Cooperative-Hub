#!/usr/bin/env python3
"""
RMP-006C1
Growth Runtime Types

Creates only:

    web/src/growth/types/content.ts
    web/src/growth/types/locale.ts
    web/src/growth/types/registry.ts
    web/src/growth/runtime/locales.ts

No other files are modified.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

FILES = {
    "web/src/growth/types/locale.ts": r'''export const SUPPORTED_LOCALES = ["vi","en","zh"] as const;

export type GrowthLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: GrowthLocale = "vi";

export function isGrowthLocale(value: string): value is GrowthLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
''',

    "web/src/growth/types/content.ts": r'''import type { GrowthLocale } from "./locale";

export interface ContentDocument {
  version: string;
  locale: GrowthLocale;
  sections: Record<string, unknown>;
}
''',

    "web/src/growth/types/registry.ts": r'''export interface RegistryDocument<T = unknown> {
  version: string;
  items: T[];
}
''',

    "web/src/growth/runtime/locales.ts": r'''export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isGrowthLocale,
} from "../types/locale";
'''
}


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

required = [
    "web/src/growth",
    "web/src/growth/types",
]

for anchor in required:

    if not Path(anchor).exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

runtime = Path("web/src/growth/runtime")

if not runtime.exists():
    runtime.mkdir(parents=True)

    print("[CREATE] web/src/growth/runtime")

#
# Verify target files absent
#

for filename in FILES:

    if Path(filename).exists():
        fail(f"Target already exists: {filename}")

ok("Mutation surface verified")

print()

print("=== Writing Runtime Types ===")

for filename, source in FILES.items():

    atomic_write(Path(filename), source)

    print(f"[WRITE] {filename}")

print()

ok("Growth runtime types created")

ok("RMP-006C1 COMPLETE")