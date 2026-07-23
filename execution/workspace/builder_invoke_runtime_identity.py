from pathlib import Path
import subprocess
import sys
import datetime

builder = Path("execution/builders/build_claude_package.py")
cib = Path(
    "governance/cib/generated/"
    "CIB-APP-REALIZATION-002H-RUNTIME-IDENTITY.md"
)

print("=" * 80)
print("CERTIFIED BUILDER INVOCATION")
print("=" * 80)

if not builder.exists():
    print(f"ERROR: Missing Builder:\n{builder}")
    sys.exit(1)

if not cib.exists():
    print(f"ERROR: Missing CIB:\n{cib}")
    sys.exit(1)

logdir = Path("execution/builder-execution")
logdir.mkdir(parents=True, exist_ok=True)

stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
logfile = logdir / f"builder_{stamp}.log"

print()
print("Builder :", builder)
print("Input   :", cib)
print("Log     :", logfile)
print()

with logfile.open("w", encoding="utf-8") as log:

    process = subprocess.run(
        [sys.executable, str(builder), str(cib)],
        stdout=log,
        stderr=subprocess.STDOUT,
        text=True,
    )

print()
print("=" * 80)

if process.returncode == 0:
    print("BUILDER EXECUTION PASSED")
else:
    print("BUILDER EXECUTION FAILED")

print("Exit Code:", process.returncode)
print()

print("Execution Log")
print("-------------")
print(logfile)

print()
print("Generated Builder Artifacts")
print("---------------------------")

package_root = Path("execution/packages")

if package_root.exists():
    found = False
    for path in sorted(package_root.rglob("*")):
        if path.is_file():
            if (
                path.name == "EXECUTION-DERIVATION.md"
                or path.name == "PACKAGE-MANIFEST.md"
                or path.name == "START-HERE.md"
                or path.suffix in (".zip", ".sha256")
            ):
                found = True
                print(path)

    if not found:
        print("<none found>")
else:
    print("<execution/packages does not exist>")

sys.exit(process.returncode)
