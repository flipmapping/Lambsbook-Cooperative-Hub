#!/usr/bin/env python3
"""
RMP-007A2
Growth Navigation Components

Creates:

    web/src/growth/components/Navigation/
        Navigation.tsx
        NavigationItem.tsx
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

NAV_DIR = ROOT / "web/src/growth/components/Navigation"
INDEX_FILE = ROOT / "web/src/growth/index.ts"

FILES = {
    "NavigationItem.tsx": """export interface NavigationItemProps {

  id: string;

  label: string;

  onClick?(): void;

}

export function NavigationItem(
  props: NavigationItemProps
) {

  return (
    <button
      type="button"
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );

}
""",
    "Navigation.tsx": """import { useRegistry } from "../../hooks/useRegistry";
import { NavigationItem } from "./NavigationItem";

export interface NavigationProps {

  onSelect?(id: string): void;

}

interface NavigationEntry {

  id: string;

  label: string;

}

export function Navigation(
  props: NavigationProps
) {

  const registry =
    useRegistry("navigation");

  const items =
    registry.items as NavigationEntry[];

  return (

    <nav>

      {items.map((item) => (

        <NavigationItem
          key={item.id}
          id={item.id}
          label={item.label}
          onClick={() => props.onSelect?.(item.id)}
        />

      ))}

    </nav>

  );

}
""",
    "index.ts": """export * from "./Navigation";
export * from "./NavigationItem";
""",
}

EXPORT_LINE = 'export * from "./components/Navigation";'


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
    ROOT / "web/src/growth/hooks/useRegistry.ts",
    INDEX_FILE,
]

for anchor in anchors:
    if not anchor.exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

if NAV_DIR.exists():
    fail("Navigation component directory already exists")

ok("Mutation surface verified")

print()
print("=== Creating Navigation Components ===")

NAV_DIR.mkdir(parents=True)

for filename, source in FILES.items():
    target = NAV_DIR / filename
    atomic_write(target, source)
    print(f"[WRITE] {target.relative_to(ROOT)}")

existing = INDEX_FILE.read_text(encoding="utf-8")

if EXPORT_LINE not in existing:
    updated = existing.rstrip() + "\n\n" + EXPORT_LINE + "\n"
    atomic_write(INDEX_FILE, updated)
    print("[UPDATE] web/src/growth/index.ts")
else:
    print("[SKIP] Navigation export already present")

print()

ok("Growth Navigation components created")
ok("RMP-007A2 COMPLETE")