#!/usr/bin/env python3

from pathlib import Path
import re

APP = Path("client/src/App.tsx")

if not APP.exists():
    raise SystemExit("ERROR: client/src/App.tsx not found")

text = APP.read_text(encoding="utf-8", errors="ignore")
lines = text.splitlines()

print("=" * 90)
print("EOS-STD-001 RUNTIME SURFACE CAPTURE")
print("=" * 90)

print("\nReact Router Evidence")
print("-" * 40)

route_pattern = re.compile(r"<Route\b[^>]*path=.*", re.IGNORECASE)

for i, line in enumerate(lines):
    if route_pattern.search(line):
        print(f"{i+1:5d}: {line.rstrip()}")

print("\nImports")
print("-" * 40)

for i, line in enumerate(lines):
    if "MemberHub" in line or "Dashboard" in line or "Hub" in line:
        print(f"{i+1:5d}: {line.rstrip()}")

print("\nTruth Capture Template")
print("-" * 40)

print("""
1. Runtime Route
2. Runtime Page
3. Rendering Hierarchy
4. Runtime Component
5. Data Source
6. Authorized Mutation Target

Populate these only from the repository evidence above.
""")

print("=" * 90)
