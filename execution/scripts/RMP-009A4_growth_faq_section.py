#!/usr/bin/env python3
"""
RMP-009A4
Growth FAQ Section

Creates

    web/src/growth/components/Sections/FAQSection.tsx

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

FAQ = SECTIONS / "FAQSection.tsx"
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

required_components = [
    "ProgramsSection.tsx",
    "ScholarshipsSection.tsx",
    "AdmissionsSection.tsx",
]

for component in required_components:
    if not (SECTIONS / component).exists():
        fail(f"Missing prerequisite: {component}")

ok("Repository anchors verified")

if FAQ.exists():
    fail("FAQSection already exists")

index_text = INDEX.read_text(encoding="utf-8")

required_exports = [
    'export * from "./ProgramsSection";',
    'export * from "./ScholarshipsSection";',
    'export * from "./AdmissionsSection";',
]

for token in required_exports:
    if token not in index_text:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if 'export * from "./FAQSection";' in index_text:
    fail("FAQ export already exists")

ok("Mutation surface verified")

print()
print("=== Creating FAQ Section ===")

SOURCE = """import { useRegistry } from "../../hooks/useRegistry";

export function FAQSection() {

  const registry =
    useRegistry("faq");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Frequently Asked Questions</h2>

      {items.length === 0 ? (

        <p>No FAQs available.</p>

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
                : `FAQ ${index + 1}`}

            </li>

          ))}

        </ul>

      )}

    </section>

  );

}
"""

atomic_write(FAQ, SOURCE)

print("[CREATE] web/src/growth/components/Sections/FAQSection.tsx")

updated = (
    index_text.rstrip()
    + '\nexport * from "./FAQSection";\n'
)

atomic_write(INDEX, updated)

print("[UPDATE] web/src/growth/components/Sections/index.ts")

print()

ok("Growth FAQ Section created")
ok("RMP-009A4 COMPLETE")