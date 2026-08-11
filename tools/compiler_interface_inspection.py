#!/usr/bin/env python3

from pathlib import Path
import ast
import json
from datetime import datetime

ROOT = Path.cwd()
COMPILER = ROOT / "execution" / "compiler"

if not COMPILER.is_dir():
    raise SystemExit("ERROR: execution/compiler does not exist")

def annotation(node):
    if node is None:
        return None
    return ast.unparse(node)

def default_value(node):
    if node is None:
        return None
    return ast.unparse(node)

def inspect_class(node):
    methods = []
    fields = []

    for item in node.body:

        if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
            args = []

            positional = list(item.args.posonlyargs) + list(item.args.args)
            defaults = [None] * (
                len(positional) - len(item.args.defaults)
            ) + list(item.args.defaults)

            for arg, default in zip(positional, defaults):
                args.append({
                    "name": arg.arg,
                    "annotation": annotation(arg.annotation),
                    "default": default_value(default)
                })

            if item.args.vararg:
                args.append({
                    "name": "*" + item.args.vararg.arg,
                    "annotation": annotation(item.args.vararg.annotation),
                    "default": None
                })

            for arg, default in zip(
                item.args.kwonlyargs,
                item.args.kw_defaults
            ):
                args.append({
                    "name": arg.arg,
                    "annotation": annotation(arg.annotation),
                    "default": default_value(default)
                })

            if item.args.kwarg:
                args.append({
                    "name": "**" + item.args.kwarg.arg,
                    "annotation": annotation(item.args.kwarg.annotation),
                    "default": None
                })

            methods.append({
                "name": item.name,
                "async": isinstance(item, ast.AsyncFunctionDef),
                "arguments": args,
                "return_annotation": annotation(item.returns),
                "decorators": [
                    ast.unparse(d) for d in item.decorator_list
                ]
            })

        elif isinstance(item, ast.AnnAssign):
            if isinstance(item.target, ast.Name):
                fields.append({
                    "name": item.target.id,
                    "annotation": annotation(item.annotation),
                    "default": (
                        ast.unparse(item.value)
                        if item.value else None
                    )
                })

        elif isinstance(item, ast.Assign):
            for target in item.targets:
                if isinstance(target, ast.Name):
                    fields.append({
                        "name": target.id,
                        "annotation": None,
                        "default": ast.unparse(item.value)
                    })

    return {
        "name": node.name,
        "bases": [ast.unparse(base) for base in node.bases],
        "decorators": [
            ast.unparse(d) for d in node.decorator_list
        ],
        "methods": methods,
        "fields": fields
    }

inspection = {
    "authority": "EMP-001M-07",
    "generated_at": datetime.utcnow().replace(
        microsecond=0
    ).isoformat() + "Z",
    "compiler_root": "execution/compiler",
    "modules": []
}

for path in sorted(COMPILER.glob("*.py")):

    source = path.read_text(
        encoding="utf-8",
        errors="replace"
    )

    tree = ast.parse(source)

    module = {
        "module": path.name,
        "classes": []
    }

    for node in tree.body:

        if isinstance(node, ast.ClassDef):
            module["classes"].append(
                inspect_class(node)
            )

    inspection["modules"].append(module)

output_dir = (
    ROOT /
    "execution" /
    "workspace" /
    "EMP-001M-07"
)

output_dir.mkdir(
    parents=True,
    exist_ok=True
)

output = (
    output_dir /
    "COMPILER-INTERFACE-INSPECTION.json"
)

output.write_text(
    json.dumps(
        inspection,
        indent=2
    ),
    encoding="utf-8"
)

print("=" * 80)
print("EMP-001M-07")
print("COMPILER INTERFACE INSPECTION")
print("=" * 80)

for module in inspection["modules"]:

    for cls in module["classes"]:

        print()
        print(
            f"{module['module']} :: "
            f"{cls['name']}"
        )

        if cls["bases"]:
            print(
                "Bases: " +
                ", ".join(cls["bases"])
            )

        if cls["fields"]:
            print("Fields:")
            for field in cls["fields"]:
                print(
                    f"  {field['name']}: "
                    f"{field['annotation']}"
                )

        if cls["methods"]:
            print("Methods:")
            for method in cls["methods"]:
                args = ", ".join(
                    a["name"]
                    for a in method["arguments"]
                )

                print(
                    f"  {method['name']}"
                    f"({args})"
                    f" -> "
                    f"{method['return_annotation']}"
                )
        else:
            print("Methods: (none)")

print()
print(
    f"Output: "
    f"{output.relative_to(ROOT)}"
)
