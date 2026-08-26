#!/bin/bash
set -euo pipefail

echo "RELEASE_GATE_WRAPPER_START"
exec node scripts/runtime-guards/enforce-release-state.cjs
