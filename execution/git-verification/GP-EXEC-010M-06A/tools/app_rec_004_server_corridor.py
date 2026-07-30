#!/usr/bin/env python3

from pathlib import Path

TARGETS = {
    "server/routes.ts": [(1335,1385)],
    "server/services/supabase-hub.ts": [(700,790)],
}

report=[]

for file,ranges in TARGETS.items():
    report.append("="*80)
    report.append(file)
    report.append("="*80)

    p=Path(file)

    if not p.exists():
        report.append("FILE NOT FOUND")
        continue

    lines=p.read_text(errors="ignore").splitlines()

    for start,end in ranges:
        report.append("")
        report.append(f"LINES {start}-{end}")
        report.append("-"*80)

        upper=min(end,len(lines))
        for i in range(start, upper+1):
            report.append(f"{i:4d}: {lines[i-1]}")

out=Path("tcrs/runtime/APP-REC-004-server-corridor.txt")
out.write_text("\n".join(report), encoding="utf-8")

print("\n".join(report))
print()
print(f"Written: {out}")
