#!/usr/bin/env python3

from pathlib import Path
import subprocess
import tempfile
import os
import sys

ROOT = Path.cwd()

def fail(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)

# Verify repository
try:
    subprocess.run(
        ["git", "rev-parse", "--is-inside-work-tree"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
except Exception:
    fail("Not inside a Git repository.")

# Verify anchor
anchor = ROOT / "governance"
if not anchor.exists():
    fail("Repository anchor 'governance/' not found.")

docs = ROOT / "docs" / "public-experience"
contracts = docs / "contracts"

for d in (docs, contracts):
    d.mkdir(parents=True, exist_ok=True)

files = {
    docs / "README.md": "# Public Experience Foundation\n",
    docs / "architecture.md": "# Architecture\nDerived from VEF-ARCH-002.\n",
    docs / "navigation-framework.md": "# Navigation Framework\n",
    docs / "journey-framework.md": "# Canonical Journey\n",
    docs / "narrative-framework.md": "# Narrative Variant Framework\n",
    docs / "content-domains.md": "# Shared Content Domains\n",
    contracts / "public-boundary.md": "# Public → Growth Engine Boundary\n",
}

for path, content in files.items():
    with tempfile.NamedTemporaryFile(
        mode="w",
        delete=False,
        dir=path.parent,
        encoding="utf-8",
    ) as tmp:
        tmp.write(content)
        temp_name = tmp.name
    os.replace(temp_name, path)

print("[PASS] Repository mutation completed successfully.")
