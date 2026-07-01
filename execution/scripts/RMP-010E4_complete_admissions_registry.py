#!/usr/bin/env python3
"""
RMP-010E4
Complete canonical Admissions Registry contract.

Safe, idempotent repository mutation.

EXEC-STD-001
"""

from pathlib import Path
import json
import platform
import re
import sys

ROOT = Path.cwd()

print("[OK] Python version:", platform.python_version())

# ---------------------------------------------------------------------
# Repository verification
# ---------------------------------------------------------------------

anchor = ROOT / "web" / "src" / "growth" / "runtime" / "defaultProvider.ts"

if not anchor.exists():
    print("[FAIL] Repository anchor not found.")
    sys.exit(1)

print("[OK] Repository anchor verified")

# ---------------------------------------------------------------------
# Create admissions registry
# ---------------------------------------------------------------------

registry_dir = ROOT / "web" / "src" / "growth" / "registry"
registry_dir.mkdir(parents=True, exist_ok=True)

registry_file = registry_dir / "admissions.json"

if not registry_file.exists():

    registry = {
        "version": "1.0",
        "items": []
    }

    registry_file.write_text(
        json.dumps(registry, indent=2) + "\n",
        encoding="utf-8"
    )

    print("[CREATE] admissions.json")

else:
    print("[OK] admissions.json already exists")

# ---------------------------------------------------------------------
# Patch defaultProvider.ts
# ---------------------------------------------------------------------

provider = anchor.read_text(encoding="utf-8")
original = provider

# ---------------------------------------------------------------------
# import
# ---------------------------------------------------------------------

import_line = (
    'import admissions from "../registry/admissions.json";'
)

if import_line not in provider:

    marker = 'import assets from "../registry/assets.json";'

    if marker not in provider:
        print("[FAIL] Import anchor not found.")
        sys.exit(1)

    provider = provider.replace(
        marker,
        marker + "\n" + import_line
    )

    print("[UPDATE] admissions import")

else:
    print("[OK] admissions import already present")

# ---------------------------------------------------------------------
# registry map
# ---------------------------------------------------------------------

pattern = re.compile(
    r"(const\s+REGISTRY\s*=\s*\{.*?assets,\s*)(\}\s*as const;)",
    re.S
)

match = pattern.search(provider)

if not match:
    print("[FAIL] REGISTRY object not found.")
    sys.exit(1)

block = match.group(0)

if "admissions," not in block:

    replacement = match.group(1) + "  admissions,\n" + match.group(2)

    provider = provider.replace(block, replacement)

    print("[UPDATE] REGISTRY mapping")

else:
    print("[OK] REGISTRY mapping already present")

# ---------------------------------------------------------------------
# Write if changed
# ---------------------------------------------------------------------

if provider != original:
    anchor.write_text(provider, encoding="utf-8")
    print("[WRITE] defaultProvider.ts")
else:
    print("[OK] defaultProvider.ts unchanged")

# ---------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------

verify = anchor.read_text(encoding="utf-8")

assert registry_file.exists()

assert import_line in verify

assert "admissions," in verify

print()
print("======================================")
print("RMP-010E4 COMPLETE")
print("======================================")
print("[PASS] admissions registry exists")
print("[PASS] provider import verified")
print("[PASS] provider mapping verified")