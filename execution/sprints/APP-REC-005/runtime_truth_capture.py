#!/usr/bin/env python3

from pathlib import Path

checks = [
    ("Route configuration", [
        "client/src/App.tsx",
        "client/src/main.tsx",
        "client/src/routes.tsx",
    ]),
    ("Member runtime page", [
        "client/src/pages/MemberHub.tsx",
    ]),
    ("Dashboard components", [
        "client/src/components",
        "client/src/pages",
    ]),
]

print("=" * 90)
print("EOS-TTG-001 RUNTIME TRUTH CAPTURE")
print("=" * 90)

for title, paths in checks:
    print(f"\n{title}")
    print("-" * len(title))
    for p in paths:
        exists = Path(p).exists()
        print(f"[{'FOUND' if exists else 'MISSING'}] {p}")

print("""
Truth Capture Required
----------------------
1. Runtime Route
2. Runtime Surface
3. Rendering Hierarchy
4. Data Source
5. Entry Component
6. Authorized Mutation Target

No further UI mutation is authorized until these six items are
certified from repository evidence.
""")

print("=" * 90)
