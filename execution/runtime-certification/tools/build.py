import subprocess
import sys

result = subprocess.run(
    ["npm", "run", "build"]
)

if result.returncode != 0:
    print("Build FAILED")
    sys.exit(result.returncode)

print("Build PASS")