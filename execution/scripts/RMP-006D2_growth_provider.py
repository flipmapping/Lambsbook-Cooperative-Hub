#!/usr/bin/env python3
"""
RMP-006D2
Growth React Provider Foundation

Creates:
    web/src/growth/components/GrowthProvider.tsx

Updates:
    web/src/growth/hooks/useLocale.ts
    web/src/growth/index.ts

Bounded mutation only.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)


PROVIDER = """import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  DEFAULT_LOCALE,
  type GrowthLocale,
} from "../types/locale";

export interface GrowthContextValue {
  locale: GrowthLocale;
  setLocale(locale: GrowthLocale): void;
}

const GrowthContext =
  createContext<GrowthContextValue | null>(null);

export function GrowthProvider(
  props: PropsWithChildren
) {

  const [locale, setLocale] =
    useState<GrowthLocale>(DEFAULT_LOCALE);

  const value =
    useMemo<GrowthContextValue>(() => ({
      locale,
      setLocale,
    }), [locale]);

  return (
    <GrowthContext.Provider value={value}>
      {props.children}
    </GrowthContext.Provider>
  );

}

export function useGrowthContext(): GrowthContextValue {

  const context = useContext(GrowthContext);

  if (!context) {
    throw new Error(
      "useGrowthContext must be used within GrowthProvider."
    );
  }

  return context;

}
"""

USE_LOCALE = """import { useGrowthContext }
  from "../components/GrowthProvider";

export function useLocale() {
  return useGrowthContext();
}
"""

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

export * from "./components/GrowthProvider";
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
    "web/src/growth/components",
    "web/src/growth/hooks/useLocale.ts",
    "web/src/growth/index.ts",
]

for anchor in anchors:
    if not Path(anchor).exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

provider_path = Path(
    "web/src/growth/components/GrowthProvider.tsx"
)

if provider_path.exists():
    fail("GrowthProvider.tsx already exists")

ok("Mutation surface verified")

print()
print("=== Writing Growth Provider ===")

atomic_write(provider_path, PROVIDER)
print("[WRITE] web/src/growth/components/GrowthProvider.tsx")

atomic_write(
    Path("web/src/growth/hooks/useLocale.ts"),
    USE_LOCALE,
)
print("[UPDATE] web/src/growth/hooks/useLocale.ts")

atomic_write(
    Path("web/src/growth/index.ts"),
    INDEX,
)
print("[UPDATE] web/src/growth/index.ts")

print()

ok("Growth Provider created")
ok("RMP-006D2 COMPLETE")