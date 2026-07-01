#!/usr/bin/env python3
"""
RMP-009A1
Growth Programs Section

Creates

    web/src/growth/components/Sections/ProgramsSection.tsx
    web/src/growth/components/Sections/index.ts

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

ROOT_INDEX = ROOT / "web/src/growth/index.ts"
COMPONENTS = ROOT / "web/src/growth/components"
SECTIONS = COMPONENTS / "Sections"

PROGRAMS = SECTIONS / "ProgramsSection.tsx"
INDEX = SECTIONS / "index.ts"

EXPORT = 'export * from "./components/Sections";'


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

if not ROOT_INDEX.exists():
    fail("Missing repository anchor: web/src/growth/index.ts")

if not COMPONENTS.exists():
    fail("Missing repository anchor: web/src/growth/components")

ok("Repository anchors verified")

if PROGRAMS.exists():
    fail("ProgramsSection already exists")

index_text = ROOT_INDEX.read_text(encoding="utf-8")

required = [
    'export * from "./components/Layout";',
]

for token in required:
    if token not in index_text:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if EXPORT in index_text:
    fail("Sections export already exists")

ok("Mutation surface verified")

print()
print("=== Creating Programs Section ===")

PROGRAM_SOURCE = """import { useRegistry } from "../../hooks/useRegistry";

export function ProgramsSection() {

  const registry =
    useRegistry("programs");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Programs</h2>

      {items.length === 0 ? (

        <p>No programs available.</p>

      ) : (

        <ul>

          {items.map((item, index) => (

            <li key={index}>

              {typeof item === "object" &&
               item !== null &&
               "title" in item
                ? String(
                    (item as Record<string, unknown>).title
                  )
                : `Program ${index + 1}`}

            </li>

          ))}

        </ul>

      )}

    </section>

  );

}
"""

INDEX_SOURCE = """export * from "./ProgramsSection";
"""

atomic_write(PROGRAMS, PROGRAM_SOURCE)

print("[CREATE] web/src/growth/components/Sections/ProgramsSection.tsx")

atomic_write(INDEX, INDEX_SOURCE)

print("[CREATE] web/src/growth/components/Sections/index.ts")

updated = index_text.rstrip() + "\n\n" + EXPORT + "\n"

atomic_write(ROOT_INDEX, updated)

print("[UPDATE] web/src/growth/index.ts")

print()

ok("Growth Programs Section created")
ok("RMP-009A1 COMPLETE")