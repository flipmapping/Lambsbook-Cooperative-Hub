#!/usr/bin/env python3

import subprocess
from pathlib import Path
from datetime import datetime

def git(*args):
    result = subprocess.run(
        ["git", *args],
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()

ROOT = Path.cwd()

status = git("status", "--short")
tracked = git("ls-files")
ignored = git("status", "--ignored", "--short")

report = [
    "# Repository Hygiene Stage 1 Report",
    "",
    f"Generated: {datetime.now().isoformat()}",
    "",
    "## Repository Root",
    f"`{ROOT}`",
    "",
    "## Working Tree",
    "```",
    status if status else "Working tree clean.",
    "```",
    "",
    "## Ignored Files",
    "```",
    ignored if ignored else "No ignored output.",
    "```",
    "",
    "## Tracked File Count",
    str(len(tracked.splitlines())),
]

outfile = ROOT / "repository_hygiene_stage1_report.md"
outfile.write_text("\n".join(report), encoding="utf-8")

print(f"Report written to: {outfile}")
