#!/usr/bin/env python3
"""
RMP-009B1
Growth Landing Composition

Updates

    web/src/growth/pages/Landing/LandingSections.tsx

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

LANDING = ROOT / "web/src/growth/pages/Landing/LandingSections.tsx"
SECTIONS = ROOT / "web/src/growth/components/Sections"


NEW_SOURCE = """import {
  ProgramsSection,
  ScholarshipsSection,
  AdmissionsSection,
  FAQSection,
} from "../../components/Sections";

export function LandingSections() {

  return (

    <>

      <ProgramsSection />

      <ScholarshipsSection />

      <AdmissionsSection />

      <FAQSection />

    </>

  );

}
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

if not LANDING.exists():
    fail("Missing repository anchor: LandingSections.tsx")

required_components = [
    "ProgramsSection.tsx",
    "ScholarshipsSection.tsx",
    "AdmissionsSection.tsx",
    "FAQSection.tsx",
]

for component in required_components:
    if not (SECTIONS / component).exists():
        fail(f"Missing prerequisite: {component}")

ok("Repository anchors verified")

baseline = LANDING.read_text(encoding="utf-8")

required_tokens = [
    "<h2>Programs</h2>",
    "<h2>Scholarships</h2>",
    "<h2>Admissions</h2>",
    "<h2>FAQ</h2>",
]

for token in required_tokens:
    if token not in baseline:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

if "<ProgramsSection />" in baseline:
    fail("Landing composition already applied")

ok("Mutation surface verified")

print()
print("=== Composing Landing Sections ===")

atomic_write(LANDING, NEW_SOURCE)

print("[UPDATE] web/src/growth/pages/Landing/LandingSections.tsx")

print()

ok("Landing composition created")
ok("RMP-009B1 COMPLETE")