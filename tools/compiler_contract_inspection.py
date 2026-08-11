#!/usr/bin/env python3

from pathlib import Path
import ast
import json
from datetime import datetime

ROOT = Path.cwd()
COMPILER = ROOT / "execution" / "compiler"

if not COMPILER.is_dir():
    raise SystemExit("ERROR: execution/compiler does not exist")

inspection = {
    "authority": "EMP-001M-07",
    "generated_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
    "compiler_root": "execution/compiler",
    "modules": []
}

for path in sorted(COMPILER.glob("*.py")):
    source = path.read_text(encoding="utf-8", errors="replace")

    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        inspection["modules"].append({
            "module": path.name,
            "syntax_valid": False,
            "syntax_error": str(exc)
        })
        continue

    imports = []
    classes = []
    functions = []
    constants = []

    for node in tree.body:

        if isinstance(node, ast.Import):
            imports.extend(alias.name for alias in node.names)

        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            imports.extend(
                f"{module}.{alias.name}" for alias in node.names
            )

        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)

        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node.name)

        elif isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id.isupper():
                    constants.append(target.id)

    inspection["modules"].append({
        "module": path.name,
        "syntax_valid": True,
        "imports": sorted(imports),
        "classes": sorted(classes),
        "functions": sorted(functions),
        "constants": sorted(constants)
    })

readme = COMPILER / "README.md"

if readme.exists():
    inspection["readme"] = readme.read_text(
        encoding="utf-8",
        errors="replace"
    )

output_dir = ROOT / "execution" / "workspace" / "EMP-001M-07"
output_dir.mkdir(parents=True, exist_ok=True)

output = output_dir / "COMPILER-CONTRACT-INSPECTION.json"

output.write_text(
    json.dumps(inspection, indent=2),
    encoding="utf-8"
)

print("=" * 80)
print("EMP-001M-07")
print("COMPILER CONTRACT INSPECTION")
print("=" * 80)

for module in inspection["modules"]:
    print()
    print(f"MODULE: {module['module']}")
    print(f"Syntax valid: {module['syntax_valid']}")

    if module["syntax_valid"]:
        print(f"Classes   : {', '.join(module['classes']) or '(none)'}")
        print(f"Functions : {', '.join(module['functions']) or '(none)'}")
        print(f"Constants : {', '.join(module['constants']) or '(none)'}")
    else:
        print(f"ERROR: {module['syntax_error']}")

print()
print(f"Output: {output.relative_to(ROOT)}")
