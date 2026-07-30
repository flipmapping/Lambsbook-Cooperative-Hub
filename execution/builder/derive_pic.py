
#!/usr/bin/env python3

from pathlib import Path
import argparse
import json
import sys

MANDATORY_HEADINGS = [
    "Mission",
    "Mutation Surface",
    "Implementation Authority",
    "Acceptance Criteria"
]

parser = argparse.ArgumentParser(
    description="Derive a deterministic PIC from a validated FAB."
)

parser.add_argument(
    "--package",
    required=True,
    help="Execution work package."
)

args = parser.parse_args()

ROOT = Path(__file__).resolve().parents[2]
package = (ROOT / args.package).resolve()
fab = package / "FAB.md"

if not fab.exists():
    print("FAB.md not found.")
    sys.exit(20)

text = fab.read_text(encoding="utf-8")

missing = [h for h in MANDATORY_HEADINGS if h not in text]

if missing:
    print("FAB validation failed.")
    print("Missing headings:")
    for h in missing:
        print("-", h)
    sys.exit(21)

pic_dir = package / "PIC"
pic_dir.mkdir(exist_ok=True)

import re

sections = {}

current = None
buffer = []

for line in fab.read_text(encoding="utf-8").splitlines():
    m = re.match(r"^##\s+(.*)$", line)

    if m:
        if current:
            sections[current] = "\n".join(buffer).strip()
        current = m.group(1).strip()
        buffer = []
    elif current:
        buffer.append(line)

if current:
    sections[current] = "\n".join(buffer).strip()

pic = {
    "schema": "PIC-1.0",
    "status": "DERIVED",
    "source_fab": str(fab.relative_to(ROOT)),
    "sections": sections
}

(pic_dir / "PIC.json").write_text(
    json.dumps(pic, indent=2)
)

print("=" * 80)
print("PIC DERIVATION COMPLETE")
print("=" * 80)
print(pic_dir / "PIC.json")

sys.exit(0)
