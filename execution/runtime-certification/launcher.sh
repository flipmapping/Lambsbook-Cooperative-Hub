#!/usr/bin/env bash
set -euo pipefail

ROOT="${HOME}/workspace"

cd "$ROOT"

mkdir -p execution/runtime-certification/reports
mkdir -p execution/runtime-certification/backups

echo
echo "=========================================="
echo " APP-RUNTIME-01"
echo " Progressive Dashboard Hydration"
echo "=========================================="

python3 execution/runtime-certification/tools/inspect.py

python3 execution/runtime-certification/tools/mutate.py

python3 execution/runtime-certification/tools/build.py

python3 execution/runtime-certification/tools/certify.py

echo
echo "=========================================="
echo " EXECUTION COMPLETE"
echo "=========================================="