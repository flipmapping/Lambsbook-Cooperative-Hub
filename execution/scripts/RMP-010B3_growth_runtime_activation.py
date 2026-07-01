#!/usr/bin/env python3
"""
RMP-010B3
Growth Runtime Activation

Updates

    client/src/App.tsx

Repository-derived bounded mutation.
"""

from __future__ import annotations

import os
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
    fail("Python 3.11 required")

ok("Python version verified")

if not (ROOT / ".git").exists():
    fail("Repository root not detected")

ok(f"Repository root: {ROOT}")

if not APP.exists():
    fail("Missing repository anchor: client/src/App.tsx")

text = APP.read_text(encoding="utf-8")

if "initializeGrowthRuntime(" in text:
    fail("Growth runtime already activated")

ok("Repository anchor verified")

print()
print("=== Activating Growth Runtime ===")

landing_import = (
    'import { LandingPage as GrowthLandingPage } from "../../web/src/growth";'
)

runtime_import = (
    'import {\n'
    '  initializeGrowthRuntime,\n'
    '  defaultGrowthRuntimeProvider,\n'
    '} from "../../web/src/growth";'
)

if landing_import not in text:
    fail("Growth import anchor not found")

text = text.replace(
    landing_import,
    landing_import + "\n" + runtime_import,
    1,
)

anchor = "function App() {"

if anchor not in text:
    fail("App() definition not found")

replacement = (
    "function App() {\n\n"
    "  initializeGrowthRuntime(\n"
    "    defaultGrowthRuntimeProvider\n"
    "  );"
)

text = text.replace(anchor, replacement, 1)

atomic_write(APP, text)

print("[UPDATE] client/src/App.tsx")
print()

ok("Growth runtime activated")
ok("RMP-010B3 COMPLETE")