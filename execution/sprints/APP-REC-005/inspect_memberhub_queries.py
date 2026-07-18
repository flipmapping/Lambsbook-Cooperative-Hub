#!/usr/bin/env python3

from pathlib import Path
import re

TARGET = Path("client/src/pages/MemberHub.tsx")

if not TARGET.exists():
    raise SystemExit("ERROR: client/src/pages/MemberHub.tsx not found")

text = TARGET.read_text(encoding="utf-8", errors="ignore")
lines = text.splitlines()

print("=" * 90)
print("APP-REC-005 MEMBERHUB QUERY INSPECTION")
print("=" * 90)

for i, line in enumerate(lines):
    if "useQuery(" in line or "queryKey:" in line:
        start = max(0, i - 3)
        end = min(len(lines), i + 18)

        print()
        print("-" * 90)
        print(f"Context around line {i+1}")
        print("-" * 90)

        for n in range(start, end):
            print(f"{n+1:5d}: {lines[n]}")

print()
print("=" * 90)
print("Detected API endpoints")
print("=" * 90)

pattern = re.compile(r'["\'](/api/[^"\']+)["\']')
found = sorted(set(pattern.findall(text)))

for endpoint in found:
    print(endpoint)

print()
print("=" * 90)
print("Inspection Complete")
print("=" * 90)
