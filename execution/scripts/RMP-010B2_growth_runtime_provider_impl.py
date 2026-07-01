#!/usr/bin/env python3
"""
RMP-010B2
Growth Runtime Provider Implementation

Creates

    web/src/growth/runtime/defaultProvider.ts

Updates

    web/src/growth/index.ts

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

RUNTIME = ROOT / "web/src/growth/runtime"
PROVIDER = RUNTIME / "defaultProvider.ts"
INDEX = ROOT / "web/src/growth/index.ts"


def fail(msg: str):
    print(f"[FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"[OK] {msg}")


def atomic_write(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
    ) as tmp:
        tmp.write(text.rstrip() + "\n")
        name = tmp.name
    os.replace(name, path)


if sys.version_info[:2] != EXPECTED:
    fail(f"Python {EXPECTED[0]}.{EXPECTED[1]} required")

ok("Python version verified")

if not (ROOT / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {ROOT}")

required = [
    ROOT / "web/src/growth/runtime/providers.ts",
    ROOT / "web/src/growth/runtime/bootstrap.ts",
    ROOT / "web/src/growth/content/en/home.json",
    ROOT / "web/src/growth/registry/programs.json",
]

for f in required:
    if not f.exists():
        fail(f"Missing repository anchor: {f.relative_to(ROOT)}")

ok("Repository anchors verified")

if PROVIDER.exists():
    fail("defaultProvider.ts already exists")

index_text = INDEX.read_text(encoding="utf-8")

if 'export * from "./runtime/defaultProvider";' in index_text:
    fail("defaultProvider already exported")

ok("Mutation surface verified")

print()
print("=== Creating Default Runtime Provider ===")

SOURCE = r'''import type {
  GrowthRuntimeProvider,
} from "./providers";

import type {
  ContentDocument,
} from "../types/content";

import type {
  RegistryDocument,
} from "../types/registry";

import type {
  GrowthLocale,
} from "../types/locale";

import type {
  RegistryName,
} from "./registry";

import home_en from "../content/en/home.json";
import home_vi from "../content/vi/home.json";
import home_zh from "../content/zh/home.json";

import programs from "../registry/programs.json";
import scholarships from "../registry/scholarships.json";
import navigation from "../registry/navigation.json";
import faq from "../registry/faq.json";
import journey from "../registry/journey.json";
import assets from "../registry/assets.json";

const CONTENT = {
  en: { home: home_en },
  vi: { home: home_vi },
  zh: { home: home_zh },
} as const;

const REGISTRY = {
  programs,
  scholarships,
  navigation,
  faq,
  journey,
  assets,
} as const;

export const defaultGrowthRuntimeProvider:
GrowthRuntimeProvider = {

  loadContent(
    locale: GrowthLocale,
    page: string
  ): ContentDocument {

    return (CONTENT as any)[locale][page];

  },

  loadRegistry(
    name: RegistryName
  ): RegistryDocument {

    return (REGISTRY as any)[name];

  },

};
'''

atomic_write(PROVIDER, SOURCE)

print("[CREATE] web/src/growth/runtime/defaultProvider.ts")

updated = (
    index_text.rstrip()
    + '\nexport * from "./runtime/defaultProvider";\n'
)

atomic_write(INDEX, updated)

print("[UPDATE] web/src/growth/index.ts")
print()

ok("Default runtime provider created")
ok("RMP-010B2 COMPLETE")