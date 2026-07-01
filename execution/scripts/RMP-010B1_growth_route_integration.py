#!/usr/bin/env python3
"""
RMP-010B1
Growth Route Integration

Updates

    client/src/App.tsx

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

EXPECTED = (3, 11)

ROOT = Path.cwd()

APP = ROOT / "client/src/App.tsx"


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
        tmp.write(text)
        name = tmp.name

    os.replace(name, path)


if sys.version_info[:2] != EXPECTED:
    fail(
        f"Python {EXPECTED[0]}.{EXPECTED[1]} required "
        f"(found {sys.version.split()[0]})"
    )

ok("Python version verified")

if not (ROOT / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {ROOT}")

if not APP.exists():
    fail("Missing repository anchor: client/src/App.tsx")

text = APP.read_text(encoding="utf-8")

if "LandingPage" in text:
    fail("Growth LandingPage already integrated")

if 'component={HubLanding}' not in text:
    fail("Expected HubLanding route not found")

ok("Repository anchor verified")

print()
print("=== Integrating Growth Landing Route ===")

import_anchor = 'import HubLanding from \'@/pages/HubLanding\';'

growth_import = (
    'import { LandingPage as GrowthLandingPage } '
    'from "../../web/src/growth";'
)

if import_anchor not in text:
    fail("Unable to locate HubLanding import")

text = text.replace(
    import_anchor,
    import_anchor + "\n" + growth_import,
    1,
)

route_anchor = (
    '      <Route path="/immigration" component={ImmigrationWebsite} />'
)

growth_route = (
    '      <Route path="/growth" component={GrowthLandingPage} />'
)

if route_anchor not in text:
    fail("Unable to locate insertion point for Growth route")

text = text.replace(
    route_anchor,
    growth_route + "\n" + route_anchor,
    1,
)

atomic_write(APP, text)

print("[UPDATE] client/src/App.tsx")
print()

ok("Growth landing route integrated")
ok("RMP-010B1 COMPLETE")