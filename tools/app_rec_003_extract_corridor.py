#!/usr/bin/env python3

from pathlib import Path

TARGETS = {
    "client/src/App.tsx": [(195,225)],
    "client/src/pages/ResetPassword.tsx": [(20,90),(60,120)],
}

report=[]

for file,ranges in TARGETS.items():

    p=Path(file)

    report.append("="*80)
    report.append(file)
    report.append("="*80)

    if not p.exists():
        report.append("FILE NOT FOUND")
        continue

    lines=p.read_text(errors="ignore").splitlines()

    for start,end in ranges:

        report.append("")
        report.append(f"LINES {start}-{end}")
        report.append("-"*80)

        for i in range(start,min(end,len(lines))+1):
            report.append(f"{i:4d}: {lines[i-1]}")

        report.append("")

out=Path("tcrs/runtime/APP-REC-003-corridor-source.txt")
out.write_text("\n".join(report),encoding="utf-8")

print("\n".join(report))
print()
print(f"Written: {out}")
