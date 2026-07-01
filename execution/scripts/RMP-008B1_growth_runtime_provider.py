#!/usr/bin/env python3
"""
RMP-008B1
Growth Runtime Provider Contract

Creates

    web/src/growth/runtime/providers.ts

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

RUNTIME_DIR = ROOT / "web/src/growth/runtime"
PROVIDER_FILE = RUNTIME_DIR / "providers.ts"
INDEX_FILE = ROOT / "web/src/growth/index.ts"

EXPORT_LINE = 'export * from "./runtime/providers";'

PROVIDER_SOURCE = """import type { ContentDocument } from "../types/content";
import type { RegistryDocument } from "../types/registry";
import type { GrowthLocale } from "../types/locale";
import type { RegistryName } from "./registry";

export interface GrowthContentProvider {

  loadContent(
    locale: GrowthLocale,
    page: string
  ): ContentDocument;

}

export interface GrowthRegistryProvider {

  loadRegistry(
    name: RegistryName
  ): RegistryDocument;

}

export interface GrowthRuntimeProvider
  extends
    GrowthContentProvider,
    GrowthRegistryProvider {}

let runtimeProvider:
  GrowthRuntimeProvider | null = null;

export function registerRuntimeProvider(
  provider: GrowthRuntimeProvider
): void {

  runtimeProvider = provider;

}

export function getRuntimeProvider():
  GrowthRuntimeProvider {

  if (!runtimeProvider) {

    throw new Error(
      "Growth runtime provider has not been registered."
    );

  }

  return runtimeProvider;

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

if not RUNTIME_DIR.exists():
    fail("Missing repository anchor: web/src/growth/runtime")

if not INDEX_FILE.exists():
    fail("Missing repository anchor: web/src/growth/index.ts")

ok("Repository anchors verified")

if PROVIDER_FILE.exists():
    fail("Runtime provider already exists")

index_text = INDEX_FILE.read_text(encoding="utf-8")

if EXPORT_LINE in index_text:
    fail("Runtime provider export already exists")

required_exports = [
    'export * from "./runtime/cache";',
    'export * from "./runtime/loader";',
]

for token in required_exports:
    if token not in index_text:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

ok("Mutation surface verified")

print()
print("=== Creating Runtime Provider Contract ===")

atomic_write(PROVIDER_FILE, PROVIDER_SOURCE)

print("[CREATE] web/src/growth/runtime/providers.ts")

updated = index_text.rstrip() + "\n\n" + EXPORT_LINE + "\n"

atomic_write(INDEX_FILE, updated)

print("[UPDATE] web/src/growth/index.ts")

print()

ok("Growth runtime provider contract created")
ok("RMP-008B1 COMPLETE")