#!/usr/bin/env python3

from pathlib import Path
import json
from datetime import datetime

ROOT = Path.cwd()

compiler = ROOT / "execution" / "compiler"

if not compiler.exists():
    raise SystemExit("ERROR: execution/compiler not found")

files = []

for p in sorted(compiler.rglob("*")):
    if p.is_file():
        files.append({
            "path": str(p.relative_to(ROOT)),
            "size": p.stat().st_size
        })

report = {
    "authority": "EMP-001M-07",
    "generated_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
    "canonical_repository": ".",
    "compiler_root": "execution/compiler",
    "compiler_exists": True,
    "file_count": len(files),
    "files": files
}

workspace = ROOT / "execution" / "workspace" / "EMP-001M-07"
workspace.mkdir(parents=True, exist_ok=True)

output = workspace / "COMPILER-SURFACE-CERTIFICATION.json"
output.write_text(json.dumps(report, indent=2), encoding="utf-8")

print("=" * 80)
print("COMPILER SURFACE CERTIFIED")
print("=" * 80)
print(f"Compiler Root : {report['compiler_root']}")
print(f"Files         : {report['file_count']}")
print(f"Output        : {output.relative_to(ROOT)}")
