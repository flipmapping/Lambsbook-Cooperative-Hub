#!/usr/bin/env python3
"""
RMP-007B1
Growth Landing Foundation

Creates

    web/src/growth/pages/
    web/src/growth/pages/Landing/

        LandingPage.tsx
        index.ts

Updates

    web/src/growth/index.ts

Repository Reality:
Derived from inspected repository.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

LANDING_DIR = ROOT / "web/src/growth/pages/Landing"

INDEX_FILE = ROOT / "web/src/growth/index.ts"

FILES = {
    "LandingPage.tsx": """import { GrowthLayout } from "../../components/Layout";
import { Hero } from "../../components/Hero";

export function LandingPage() {

  return (

    <GrowthLayout>

      <Hero />

    </GrowthLayout>

  );

}
""",

    "index.ts": """export * from "./LandingPage";
"""
}

EXPORT_LINE = 'export * from "./pages/Landing";'


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

    ROOT / "web/src/growth/components",

    ROOT / "web/src/growth/components/Hero",

    ROOT / "web/src/growth/components/Layout",

    INDEX_FILE,

]

for anchor in anchors:

    if not anchor.exists():
        fail(f"Missing anchor: {anchor}")

ok("Repository anchors verified")

if LANDING_DIR.exists():
    fail("Landing page already exists")

ok("Mutation surface verified")

print()
print("=== Creating Landing Foundation ===")

LANDING_DIR.mkdir(
    parents=True,
    exist_ok=False,
)

for filename, source in FILES.items():

    target = LANDING_DIR / filename

    atomic_write(target, source)

    print(f"[WRITE] {target.relative_to(ROOT)}")

existing = INDEX_FILE.read_text(
    encoding="utf-8"
)

if EXPORT_LINE not in existing:

    updated = (
        existing.rstrip()
        + "\n\n"
        + EXPORT_LINE
        + "\n"
    )

    atomic_write(
        INDEX_FILE,
        updated,
    )

    print("[UPDATE] web/src/growth/index.ts")

else:

    print("[SKIP] Landing export already present")

print()

ok("Growth Landing Foundation created")
ok("RMP-007B1 COMPLETE")