#!/usr/bin/env python3

import subprocess
from pathlib import Path
from datetime import datetime

ROOT = Path.cwd()

result = subprocess.run(
    ["git", "status", "--porcelain=v1"],
    capture_output=True,
    text=True,
    check=True,
)

lines = result.stdout.splitlines()

groups = {
    "Modified": [],
    "Deleted": [],
    "Added": [],
    "Renamed": [],
    "Untracked": [],
    "Other": [],
}

for line in lines:
    status = line[:2]
    path = line[3:]

    if "M" in status:
        groups["Modified"].append(path)
    elif "D" in status:
        groups["Deleted"].append(path)
    elif "A" in status:
        groups["Added"].append(path)
    elif "R" in status:
        groups["Renamed"].append(path)
    elif status == "??":
        groups["Untracked"].append(path)
    else:
        groups["Other"].append(f"{status} {path}")

report = []

report.append("# Repository Impact Audit")
report.append("")
report.append(f"Generated: {datetime.now().isoformat()}")
report.append("")

for section in [
    "Modified",
    "Deleted",
    "Added",
    "Renamed",
    "Untracked",
    "Other",
]:
    report.append(f"## {section}")
    report.append(f"Count: {len(groups[section])}")
    report.append("")
    for item in sorted(groups[section]):
        report.append(f"- {item}")
    report.append("")

out = ROOT / "repository_impact_audit.md"
out.write_text("\n".join(report), encoding="utf-8")

print("=" * 72)
print("REPOSITORY IMPACT AUDIT COMPLETE")
print("=" * 72)

for k in groups:
    print(f"{k:12} {len(groups[k])}")

print()
print(out)
