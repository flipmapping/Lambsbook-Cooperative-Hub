#!/usr/bin/env python3

import subprocess
import shutil
from pathlib import Path

ROOT = Path.cwd()

print("=" * 72)
print("MAIN APPLICATION IMPLEMENTATION READINESS")
print("=" * 72)

commands = [
    ("Node", ["node", "--version"]),
    ("NPM", ["npm", "--version"]),
]

for name, cmd in commands:
    try:
        out = subprocess.check_output(cmd, text=True).strip()
        print(f"[OK] {name}: {out}")
    except Exception as ex:
        print(f"[FAIL] {name}: {ex}")

print()

package_json = ROOT / "package.json"

if not package_json.exists():
    print("ERROR: package.json not found.")
    raise SystemExit(1)

print("[OK] package.json found")

required = [
    "server",
    "client",
    "web",
]

for item in required:
    p = ROOT / item
    print(f"[{'OK' if p.exists() else 'MISS'}] {item}")

print()

if shutil.which("npm") is None:
    print("npm unavailable.")
    raise SystemExit(1)

print("=" * 72)
print("Running production build...")
print("=" * 72)

result = subprocess.run(
    ["npm", "run", "build"],
    text=True
)

print("=" * 72)
print("BUILD EXIT CODE:", result.returncode)
print("=" * 72)

raise SystemExit(result.returncode)
