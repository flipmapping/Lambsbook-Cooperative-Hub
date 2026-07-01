#!/usr/bin/env python3
"""
RMP-010C2

Allow Vite internal development module requests while
preserving the existing security middleware.
"""

from pathlib import Path
import os
import sys
from tempfile import NamedTemporaryFile

ROOT = Path.cwd()
TARGET = ROOT / "server/index.ts"

EXPECTED = (3, 11)


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
    fail("Missing server/index.ts")

ok("Repository anchor verified")

text = TARGET.read_text(encoding="utf-8")

anchor = """  const url = decodeURIComponent(req.url.toLowerCase());
"""

replacement = """  const url = decodeURIComponent(req.url.toLowerCase());

  if (
    process.env.NODE_ENV === "development" &&
    (
      url.startswith("/@vite") or
      url.startswith("/@fs/") or
      url.startswith("/vite-hmr") or
      url.startswith("/@react-refresh")
    )
  ) {
    return next();
  }
"""

# Convert Python-style helper text into TypeScript.
replacement = replacement.replace("startswith", "startsWith")
replacement = replacement.replace(" or\n", " ||\n")
replacement = replacement.replace(" or ", " || ")

if anchor not in text:
    fail("Anchor not found")

text = text.replace(anchor, replacement, 1)

atomic_write(TARGET, text)

print("[UPDATE] server/index.ts")
print()

ok("Vite compatibility exception added")
ok("RMP-010C2 COMPLETE")