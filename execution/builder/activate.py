
#!/usr/bin/env python3

from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]

activation_file = ROOT / "execution" / "builder" / "activation.json"

cfg = json.loads(activation_file.read_text())

entrypoint = cfg["activation"]["entrypoint"].strip()
runtime = cfg["activation"]["runtime"].strip()
arguments = cfg["activation"]["arguments"]

if not entrypoint:
    print("=" * 80)
    print("EOS GOVERNANCE FAILURE")
    print("=" * 80)
    print()
    print("Builder Activation Contract exists")
    print("Builder entrypoint has not been registered.")
    print()
    print("Repository governance must populate:")
    print("execution/builder/activation.json")
    sys.exit(20)

cmd = []

if runtime.lower() == "python":
    cmd = [sys.executable, entrypoint]

elif runtime.lower() == "node":
    cmd = ["node", entrypoint]

elif runtime:
    cmd = [runtime, entrypoint]

else:
    print("No runtime configured.")
    sys.exit(21)

cmd.extend(arguments)

print("=" * 80)
print("ACTIVATING BUILDER")
print("=" * 80)
print("Command:")
print(" ".join(cmd))
print()

sys.exit(subprocess.call(cmd))
