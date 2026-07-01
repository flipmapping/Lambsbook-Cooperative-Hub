#!/usr/bin/env python3
"""
RMP-006C2
Growth Runtime Loader

Creates:

    web/src/growth/runtime/cache.ts
    web/src/growth/runtime/resolver.ts
    web/src/growth/runtime/registry.ts
    web/src/growth/runtime/loader.ts

Updates:

    web/src/growth/index.ts

Bounded mutation only.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)


FILES = {

"web/src/growth/runtime/cache.ts": """const runtimeCache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return runtimeCache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  runtimeCache.set(key, value);
}

export function clearRuntimeCache(): void {
  runtimeCache.clear();
}
""",

"web/src/growth/runtime/resolver.ts": """import {
  DEFAULT_LOCALE,
  GrowthLocale,
  isGrowthLocale,
} from "../types/locale";

export function resolveLocale(
  requested?: string
): GrowthLocale {

  if (requested && isGrowthLocale(requested)) {
    return requested;
  }

  return DEFAULT_LOCALE;
}
""",

"web/src/growth/runtime/registry.ts": """export const REGISTRIES = {
  assets: "assets",
  faq: "faq",
  journey: "journey",
  navigation: "navigation",
  programs: "programs",
  scholarships: "scholarships",
} as const;

export type RegistryName =
  typeof REGISTRIES[keyof typeof REGISTRIES];
""",

"web/src/growth/runtime/loader.ts": """import { getCached, setCached } from "./cache";
import { resolveLocale } from "./resolver";
import type { ContentDocument } from "../types/content";
import type { RegistryDocument } from "../types/registry";
import type { GrowthLocale } from "../types/locale";

export function loadContent(
  locale: string,
  page: string
): ContentDocument {

  const resolved: GrowthLocale = resolveLocale(locale);
  const key = `content:${resolved}:${page}`;

  const cached = getCached<ContentDocument>(key);

  if (cached) {
    return cached;
  }

  throw new Error(
    "Growth content loader not yet connected to JSON registry."
  );
}

export function loadRegistry(
  name: string
): RegistryDocument {

  const key = `registry:${name}`;

  const cached = getCached<RegistryDocument>(key);

  if (cached) {
    return cached;
  }

  throw new Error(
    "Growth registry loader not yet connected to JSON registry."
  );
}

export { setCached };
""",
}

INDEX = """/*
 * Growth Engine
 */

export * from "./runtime/cache";
export * from "./runtime/loader";
export * from "./runtime/locales";
export * from "./runtime/registry";
export * from "./runtime/resolver";

export * from "./types/content";
export * from "./types/locale";
export * from "./types/registry";
"""


def fail(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)


def ok(msg):
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
    fail("Python 3.11 required")

ok("Python version verified")

repo = Path.cwd()

if not (repo / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {repo}")

anchors = [
    "web/src/growth/runtime",
    "web/src/growth/types",
    "web/src/growth/index.ts",
]

for anchor in anchors:

    if not Path(anchor).exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

for filename in FILES:

    if Path(filename).exists():
        fail(f"Target already exists: {filename}")

ok("Mutation surface verified")

print()

print("=== Writing Runtime Layer ===")

for filename, source in FILES.items():

    atomic_write(Path(filename), source)

    print(f"[WRITE] {filename}")

atomic_write(
    Path("web/src/growth/index.ts"),
    INDEX,
)

print("[UPDATE] web/src/growth/index.ts")

print()

ok("Growth runtime created")

ok("RMP-006C2 COMPLETE")