#!/usr/bin/env python3
"""
RMP-006D1
Growth React Hooks Foundation

Creates:

    web/src/growth/hooks/useContent.ts
    web/src/growth/hooks/useRegistry.ts
    web/src/growth/hooks/useLocale.ts

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


HOOK_FILES = {

"web/src/growth/hooks/useContent.ts": """import { useMemo } from "react";

import { loadContent } from "../runtime/loader";
import { resolveLocale } from "../runtime/resolver";

import type { ContentDocument } from "../types/content";
import type { GrowthLocale } from "../types/locale";

export function useContent(
  page: string,
  locale?: GrowthLocale
): ContentDocument {

  return useMemo(() => {

    const resolved = resolveLocale(locale);

    return loadContent(resolved, page);

  }, [page, locale]);

}
""",

"web/src/growth/hooks/useRegistry.ts": """import { useMemo } from "react";

import { loadRegistry } from "../runtime/loader";

import type { RegistryDocument } from "../types/registry";
import type { RegistryName } from "../runtime/registry";

export function useRegistry(
  name: RegistryName
): RegistryDocument {

  return useMemo(() => {

    return loadRegistry(name);

  }, [name]);

}
""",

"web/src/growth/hooks/useLocale.ts": """import { useState } from "react";

import {
  DEFAULT_LOCALE,
  type GrowthLocale,
} from "../types/locale";

export interface GrowthLocaleState {

  locale: GrowthLocale;

  setLocale(
    locale: GrowthLocale
  ): void;

}

export function useLocale(): GrowthLocaleState {

  const [locale, setLocale] =
    useState<GrowthLocale>(DEFAULT_LOCALE);

  return {

    locale,

    setLocale,

  };

}
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

export * from "./hooks/useContent";
export * from "./hooks/useRegistry";
export * from "./hooks/useLocale";
"""


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str) -> None:
    print(f"[OK] {message}")


def atomic_write(path: Path, text: str) -> None:
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
    "web/src/growth/runtime",
    "web/src/growth/types",
    "web/src/growth/hooks",
    "web/src/growth/index.ts",
]

for anchor in anchors:
    if not Path(anchor).exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

for filename in HOOK_FILES:
    if Path(filename).exists():
        fail(f"Target already exists: {filename}")

ok("Mutation surface verified")

print()
print("=== Writing Growth Hooks ===")

for filename, source in HOOK_FILES.items():
    atomic_write(Path(filename), source)
    print(f"[WRITE] {filename}")

atomic_write(
    Path("web/src/growth/index.ts"),
    INDEX,
)

print("[UPDATE] web/src/growth/index.ts")

print()

ok("Growth hooks created")
ok("RMP-006D1 COMPLETE")