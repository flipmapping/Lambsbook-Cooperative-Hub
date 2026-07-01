#!/usr/bin/env python3
"""
RMP-008B3
Growth Runtime Bootstrap

Creates

    web/src/growth/runtime/bootstrap.ts

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

RUNTIME_DIR = ROOT / "web/src/growth/runtime"
BOOTSTRAP_FILE = RUNTIME_DIR / "bootstrap.ts"
INDEX_FILE = ROOT / "web/src/growth/index.ts"

EXPORT_LINE = 'export * from "./runtime/bootstrap";'

BOOTSTRAP_SOURCE = """import {
  registerRuntimeProvider,
  type GrowthRuntimeProvider,
} from "./providers";

let initialized = false;

export function initializeGrowthRuntime(
  provider: GrowthRuntimeProvider
): void {

  if (initialized) {
    return;
  }

  registerRuntimeProvider(provider);

  initialized = true;

}

export function isGrowthRuntimeInitialized(): boolean {

  return initialized;

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

if not RUNTIME_DIR.exists():
    fail("Missing repository anchor: web/src/growth/runtime")

if not INDEX_FILE.exists():
    fail("Missing repository anchor: web/src/growth/index.ts")

PROVIDERS = RUNTIME_DIR / "providers.ts"

if not PROVIDERS.exists():
    fail("Missing prerequisite: runtime/providers.ts")

ok("Repository anchors verified")

if BOOTSTRAP_FILE.exists():
    fail("Runtime bootstrap already exists")

index_text = INDEX_FILE.read_text(encoding="utf-8")

if EXPORT_LINE in index_text:
    fail("Bootstrap export already exists")

required = [
    'export * from "./runtime/providers";',
]

for token in required:
    if token not in index_text:
        fail(
            "Repository Reality differs from inspected baseline "
            f"(missing: {token})"
        )

ok("Mutation surface verified")

print()
print("=== Creating Runtime Bootstrap ===")

atomic_write(
    BOOTSTRAP_FILE,
    BOOTSTRAP_SOURCE,
)

print("[CREATE] web/src/growth/runtime/bootstrap.ts")

updated = index_text.rstrip() + "\n\n" + EXPORT_LINE + "\n"

atomic_write(
    INDEX_FILE,
    updated,
)

print("[UPDATE] web/src/growth/index.ts")

print()

ok("Growth runtime bootstrap created")
ok("RMP-008B3 COMPLETE")