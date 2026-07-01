#!/usr/bin/env python3
"""
RMP-010C3

Allow Vite internal development routes to bypass the SPA fallback.
"""

from pathlib import Path
from tempfile import NamedTemporaryFile
import os
import sys

EXPECTED = (3, 11)

ROOT = Path.cwd()
TARGET = ROOT / "server/vite.ts"


def fail(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)


def ok(msg):
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

if not TARGET.exists():
    fail("Missing repository anchor: server/vite.ts")

ok("Repository anchor verified")

text = TARGET.read_text(encoding="utf-8")

old = """    // CRITICAL: do not let SPA fallback handle API routes
    if (req.path.startsWith("/api")) {
      return next();
    }
"""

new = """    // CRITICAL: do not let SPA fallback handle
    // API or Vite development routes.
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/@vite") ||
      req.path.startsWith("/@fs/") ||
      req.path.startsWith("/vite-hmr") ||
      req.path.startsWith("/@react-refresh")
    ) {
      return next();
    }
"""

if old not in text:
    fail("SPA fallback guard not found")

text = text.replace(old, new, 1)

atomic_write(TARGET, text)

print("[UPDATE] server/vite.ts")
print()

ok("SPA fallback updated")
ok("RMP-010C3 COMPLETE")