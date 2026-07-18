#!/usr/bin/env python3

import subprocess
from pathlib import Path

report = []
report.append("=" * 80)
report.append("RRG-001")
report.append("REPOSITORY READINESS GATE")
report.append("=" * 80)

def run(cmd):
    try:
        return subprocess.check_output(cmd, text=True).strip()
    except subprocess.CalledProcessError as e:
        return e.output.strip()

status = run(["git", "status", "--short"])

report.append("")
report.append("REPOSITORY STATUS")
report.append("-" * 80)

if status:
    report.extend(status.splitlines())
else:
    report.append("Working tree clean")

report.append("")
report.append("CLASSIFICATION GUIDANCE")
report.append("-" * 80)
report.append("AUTHORIZED-PRODUCTION : client/src, server, migrations, SQL")
report.append("AUTHORIZED-EVIDENCE   : tools, tcrs, execution")
report.append("OUT-OF-SCOPE          : unrelated production changes")
report.append("IGNORE                : build outputs, caches, temp files")

report.append("")
report.append("NEXT STEP")
report.append("-" * 80)
report.append("After bounded production mutation:")
report.append("  1. Run git diff --stat")
report.append("  2. Run production build")
report.append("  3. Classify every changed file")
report.append("  4. Produce Repository Readiness Report")
report.append("  5. Await Founder approval before commit")

out = Path("tcrs/repository/RRG-001-readiness-report.txt")
out.write_text("\n".join(report), encoding="utf-8")

print("\n".join(report))
print()
print(f"Report written to: {out}")
