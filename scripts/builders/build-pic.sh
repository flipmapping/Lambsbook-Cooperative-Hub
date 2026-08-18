#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
CIB="${1:?CIB path required}"
shift
exec python3 -m execution.builders.build_claude_package "$CIB" --repo-root "$REPO_ROOT" "$@"
