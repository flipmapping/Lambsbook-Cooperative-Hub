#!/usr/bin/env python3
"""
RMP-009A3
Growth Admissions Section

Creates

    web/src/growth/components/Sections/AdmissionsSection.tsx

Updates

    web/src/growth/components/Sections/index.ts

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

SECTIONS = ROOT / "web/src/growth/components/Sections"

ADMISSIONS = SECTIONS / "AdmissionsSection.tsx"
INDEX = SECTIONS / "index.ts"


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

if not SECTIONS.exists():
    fail("Missing repository anchor: web/src/growth/components/Sections")

if not INDEX.exists():
    fail("Missing repository anchor: web/src/growth/components/Sections/index.ts")

if not (SECTIONS / "ProgramsSection.tsx").exists():
    fail("Missing prerequisite: ProgramsSection.tsx")

if not (SECTIONS / "ScholarshipsSection.tsx").exists():
    fail("Missing prerequisite: ScholarshipsSection.tsx")

ok("Repository anchors verified")

if ADMISSIONS.exists():
    fail("AdmissionsSection already exists")

index_text = INDEX.read_text(encoding="utf-8")

required = [
    'export * from "./ProgramsSection";',
    'export * from "./ScholarshipsSection";',
]

for token in required:
    if token not in index_text:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if 'export * from "./AdmissionsSection";' in index_text:
    fail("Admissions export already exists")

ok("Mutation surface verified")

print()
print("=== Creating Admissions Section ===")

SOURCE = """import { useRegistry } from "../../hooks/useRegistry";

export function AdmissionsSection() {

  const registry =
    useRegistry("admissions");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Admissions</h2>

      {items.length === 0 ? (

        <p>No admissions available.</p>

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
                : `Admission ${index + 1}`}

            </li>

          ))}

        </ul>

      )}

    </section>

  );

}
"""

atomic_write(
    ADMISSIONS,
    SOURCE,
)

print("[CREATE] web/src/growth/components/Sections/AdmissionsSection.tsx")

updated = (
    index_text.rstrip()
    + '\nexport * from "./AdmissionsSection";\n'
)

atomic_write(
    INDEX,
    updated,
)

print("[UPDATE] web/src/growth/components/Sections/index.ts")

print()

ok("Growth Admissions Section created")
ok("RMP-009A3 COMPLETE")