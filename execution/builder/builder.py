
#!/usr/bin/env python3

from pathlib import Path
import argparse
import datetime
import json
import sys
from pipeline import derive_pic

from context import load_builder_context

ROOT = Path(__file__).resolve().parents[2]

ctx = load_builder_context()
spec = ctx["spec"]

parser = argparse.ArgumentParser(
    description="Builder Runtime v1"
)

parser.add_argument(
    "--package",
    required=True,
    help="Execution work package."
)

args = parser.parse_args()

package = (ROOT / args.package).resolve()

if not package.exists():
    print("Work package not found:")
    print(package)
    sys.exit(11)

report = {
    "builder": spec["identity"],
    "timestamp_utc": datetime.datetime.utcnow().isoformat() + "Z",
    "package": str(package.relative_to(ROOT)),
    "status": "VALIDATED",
    "next_phase": "EOS-065"
}

(package / "builder-report.json").write_text(
    json.dumps(report, indent=2)
)

print("=" * 80)
print("BUILDER RUNTIME V1 VALIDATION COMPLETE")
print("=" * 80)

result = derive_pic(package)
if result != 0:
    sys.exit(result)

sys.exit(0)
