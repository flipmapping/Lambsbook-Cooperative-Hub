#!/usr/bin/env python3
"""
RMP-007A3
Growth Layout Foundation

Creates:

    web/src/growth/components/Layout/
        GrowthLayout.tsx
        index.ts

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

ROOT = Path.cwd()

LAYOUT_DIR = ROOT / "web/src/growth/components/Layout"
INDEX_FILE = ROOT / "web/src/growth/index.ts"

FILES = {
    "GrowthLayout.tsx": """import type { PropsWithChildren } from "react";

import { GrowthProvider } from "../GrowthProvider";
import { Navigation } from "../Navigation";

export interface GrowthLayoutProps
  extends PropsWithChildren {

  onNavigate?(id: string): void;

}

export function GrowthLayout(
  props: GrowthLayoutProps
) {

  return (

    <GrowthProvider>

      <Navigation
        onSelect={props.onNavigate}
      />

      <main>

        {props.children}

      </main>

      <footer>

        Growth Platform

      </footer>

    </GrowthProvider>

  );

}
""",
    "index.ts": """export * from "./GrowthLayout";
""",
}

EXPORT_LINE = 'export * from "./components/Layout";'


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    sys.exit(1)


def ok(message: str) -> None:
    print(f"[OK] {message}")


def atomic_write(path: Path, text: str) -> None:
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

anchors = [
    ROOT / "web/src/growth/components",
    ROOT / "web/src/growth/components/GrowthProvider.tsx",
    ROOT / "web/src/growth/components/Navigation",
    INDEX_FILE,
]

for anchor in anchors:
    if not anchor.exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

if LAYOUT_DIR.exists():
    fail("Layout component directory already exists")

ok("Mutation surface verified")

print()
print("=== Creating Growth Layout ===")

LAYOUT_DIR.mkdir(parents=True)

for filename, source in FILES.items():
    target = LAYOUT_DIR / filename
    atomic_write(target, source)
    print(f"[WRITE] {target.relative_to(ROOT)}")

existing = INDEX_FILE.read_text(encoding="utf-8")

if EXPORT_LINE not in existing:
    updated = existing.rstrip() + "\n\n" + EXPORT_LINE + "\n"
    atomic_write(INDEX_FILE, updated)
    print("[UPDATE] web/src/growth/index.ts")
else:
    print("[SKIP] Layout export already present")

print()

ok("Growth Layout created")
ok("RMP-007A3 COMPLETE")