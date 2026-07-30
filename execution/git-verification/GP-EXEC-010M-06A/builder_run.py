from pathlib import Path
import subprocess
import sys
import datetime

builder = Path("execution/builders/build_claude_package.py")
cib = Path("governance/cib/generated/CIB-APP-REALIZATION-002H-RUNTIME-IDENTITY.md")

assert builder.exists(), builder
assert cib.exists(), cib

logdir = Path("execution/builder-execution")
logdir.mkdir(parents=True, exist_ok=True)

log = logdir / ("builder_" +
                datetime.datetime.now().strftime("%Y%m%d_%H%M%S") +
                ".log")

print("=" * 80)
print("CERTIFIED BUILDER INVOCATION")
print("=" * 80)
print("Builder :", builder)
print("Input   :", cib)
print("Log     :", log)
print()

with log.open("w", encoding="utf-8") as f:
    rc = subprocess.run(
        [sys.executable, str(builder), str(cib)],
        stdout=f,
        stderr=subprocess.STDOUT,
    ).returncode

print()
print("Exit Code:", rc)
print()

pkg = Path("execution/packages")
if pkg.exists():
    print("Generated Artifacts")
    print("-------------------")
    for p in sorted(pkg.rglob("*")):
        if p.is_file():
            print(p)

sys.exit(rc)
