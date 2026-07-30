#!/usr/bin/env python3

import subprocess
from pathlib import Path
from datetime import datetime

ROOT = Path.cwd()

status = subprocess.run(
    ["git", "status", "--porcelain=v1"],
    capture_output=True,
    text=True,
    check=True,
).stdout.splitlines()

rows = []

for line in status:
    code = line[:2]
    path = line[3:]

    if "M" in code:
        change = "MODIFIED"
    elif "D" in code:
        change = "DELETED"
    elif code == "??":
        change = "UNTRACKED"
    elif "A" in code:
        change = "ADDED"
    elif "R" in code:
        change = "RENAMED"
    else:
        change = code.strip()

    if change == "DELETED":
        decision = "REVIEW (KEEP or RESTORE)"
    elif change == "MODIFIED":
        decision = "DEFER TO IMPLEMENTATION STREAM"
    elif change in ("UNTRACKED", "ADDED"):
        decision = "DEFER TO IMPLEMENTATION STREAM"
    else:
        decision = "REVIEW"

    rows.append((change, path, decision))

rows.sort(key=lambda x: (x[0], x[1]))

report = [
    "# Repository Decision Matrix",
    "",
    f"Generated: {datetime.now().isoformat()}",
    "",
    "| Change | Path | Recommended Decision |",
    "|--------|------|----------------------|",
]

for change, path, decision in rows:
    report.append(f"| {change} | {path} | {decision} |")

output = ROOT / "repository_decision_matrix.md"
output.write_text("\n".join(report), encoding="utf-8")

print("=" * 72)
print("REPOSITORY DECISION MATRIX GENERATED")
print("=" * 72)
print(output)
