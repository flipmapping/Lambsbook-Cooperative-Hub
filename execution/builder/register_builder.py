
#!/usr/bin/env python3

from pathlib import Path
import json
import argparse
import sys

ROOT = Path(__file__).resolve().parents[2]
ACTIVATION = ROOT / "execution" / "builder" / "activation.json"

parser = argparse.ArgumentParser(
    description="Register the canonical Builder activation surface."
)

parser.add_argument("--entrypoint", required=True)
parser.add_argument("--runtime", required=True)
parser.add_argument(
    "--argument",
    action="append",
    default=[]
)

args = parser.parse_args()

cfg = json.loads(ACTIVATION.read_text())

cfg["activation"]["entrypoint"] = args.entrypoint
cfg["activation"]["runtime"] = args.runtime
cfg["activation"]["arguments"] = args.argument

ACTIVATION.write_text(
    json.dumps(cfg, indent=2)
)

print("=" * 80)
print("BUILDER REGISTERED")
print("=" * 80)
print(json.dumps(cfg["activation"], indent=2))
