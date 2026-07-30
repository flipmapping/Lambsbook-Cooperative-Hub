#!/usr/bin/env python3

from pathlib import Path

ROOT = Path.cwd()

patterns = [
    "*.candidate",
    "*.pre-*",
    "*.bak",
]

candidate_paths = set()

for pattern in patterns:
    for p in ROOT.rglob(pattern):
        if ".git" not in p.parts:
            candidate_paths.add(p)

for folder in [
    ROOT / "execution" / "recovery",
    ROOT / "execution" / "builders" / "recovery",
]:
    if folder.exists():
        candidate_paths.add(folder)

candidate_paths = sorted(candidate_paths)

outfile = ROOT / "repository_cleanup_candidates.txt"

with outfile.open("w", encoding="utf-8") as f:
    for path in candidate_paths:
        f.write(str(path.relative_to(ROOT)) + "\n")

print("=" * 72)
print("EOS-REPO-001A STAGE 2")
print("=" * 72)
print(f"Cleanup candidates found : {len(candidate_paths)}")
print(f"Output file             : {outfile}")
print()

for path in candidate_paths:
    print(path.relative_to(ROOT))
