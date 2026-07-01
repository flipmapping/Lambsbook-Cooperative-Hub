#!/usr/bin/env python3
"""
RMP-007B2
Landing Sections Composition

Creates

    web/src/growth/pages/Landing/LandingSections.tsx

Updates

    web/src/growth/pages/Landing/LandingPage.tsx

Bounded mutation only.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

LANDING_DIR = ROOT / "web/src/growth/pages/Landing"
LANDING_PAGE = LANDING_DIR / "LandingPage.tsx"
LANDING_SECTIONS = LANDING_DIR / "LandingSections.tsx"

SECTIONS_SOURCE = """export function LandingSections() {

  return (

    <>

      <section>

        <h2>Programs</h2>

        <p>
          Programs placeholder
        </p>

      </section>

      <section>

        <h2>Scholarships</h2>

        <p>
          Scholarships placeholder
        </p>

      </section>

      <section>

        <h2>Admissions</h2>

        <p>
          Admissions placeholder
        </p>

      </section>

      <section>

        <h2>FAQ</h2>

        <p>
          FAQ placeholder
        </p>

      </section>

    </>

  );

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

anchors = [
    ROOT / "web/src/growth",
    LANDING_DIR,
    LANDING_PAGE,
]

for anchor in anchors:
    if not anchor.exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

if LANDING_SECTIONS.exists():
    fail("LandingSections.tsx already exists")

page = LANDING_PAGE.read_text(encoding="utf-8")

if 'import { Hero } from "../../components/Hero";' not in page:
    fail("LandingPage baseline differs from inspected Repository Reality")

if "LandingSections" in page:
    fail("LandingSections already referenced")

ok("Mutation surface verified")

print()
print("=== Creating Landing Sections ===")

atomic_write(LANDING_SECTIONS, SECTIONS_SOURCE)

print(f"[WRITE] {LANDING_SECTIONS.relative_to(ROOT)}")

#
# Update LandingPage.tsx
#

updated = page

import_line = 'import { LandingSections } from "./LandingSections";'

if import_line not in updated:
    updated = updated.replace(
        'import { Hero } from "../../components/Hero";',
        'import { Hero } from "../../components/Hero";\n'
        + import_line,
    )

updated = re.sub(
    r'(<Hero\s*/>)',
    r'\1\n\n      <LandingSections />',
    updated,
    count=1,
)

atomic_write(LANDING_PAGE, updated)

print(f"[UPDATE] {LANDING_PAGE.relative_to(ROOT)}")

print()

ok("Landing sections composed")
ok("RMP-007B2 COMPLETE")