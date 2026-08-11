#!/usr/bin/env python3

import json
import sys
from pathlib import Path

ROOT = Path.cwd()

sys.path.insert(0, str(ROOT / "execution"))

from compiler.contracts import CompilerContext
from compiler.context_resolver import ContextResolver
from compiler.models import CanonicalExecutionModel
from compiler.events import ExecutionEvent


context = CompilerContext(
    execution_authority="EMP-001M-07",
    implementation_context={
        "objective": "Context Resolver contract smoke test"
    },
    repository={
        "name": ".",
        "root": str(ROOT)
    }
)

resolver = ContextResolver()

result = resolver.resolve(context)

if not isinstance(result, tuple):
    raise SystemExit(
        f"FAIL: resolve() returned {type(result).__name__}, expected tuple"
    )

if len(result) != 2:
    raise SystemExit(
        f"FAIL: resolve() returned {len(result)} values, expected 2"
    )

model, event = result

if not isinstance(model, CanonicalExecutionModel):
    raise SystemExit(
        f"FAIL: first result is {type(model).__name__}, "
        "expected CanonicalExecutionModel"
    )

if not isinstance(event, ExecutionEvent):
    raise SystemExit(
        f"FAIL: second result is {type(event).__name__}, "
        "expected ExecutionEvent"
    )

if not isinstance(event.event_type, str):
    raise SystemExit("FAIL: ExecutionEvent.event_type is not a string")

if not isinstance(event.stage, str):
    raise SystemExit("FAIL: ExecutionEvent.stage is not a string")

if event.authority != "EMP-001M-07":
    raise SystemExit(
        "FAIL: ExecutionEvent.authority does not match "
        "CompilerContext.execution_authority"
    )

verification = {
    "authority": "EMP-001M-07",
    "status": "PASS",
    "resolver": "ContextResolver",
    "model_type": type(model).__name__,
    "event_type": type(event).__name__,
    "event": {
        "event_type": event.event_type,
        "stage": event.stage,
        "authority": event.authority,
        "timestamp": event.timestamp,
        "payload": event.payload,
        "diagnostics": event.diagnostics,
    }
}

output_dir = (
    ROOT /
    "execution" /
    "workspace" /
    "EMP-001M-07"
)

output_dir.mkdir(parents=True, exist_ok=True)

output = output_dir / "CONTEXT-RESOLVER-SMOKE.json"

output.write_text(
    json.dumps(verification, indent=2),
    encoding="utf-8"
)

print("=" * 80)
print("EMP-001M-07 CONTEXT RESOLVER SMOKE TEST")
print("=" * 80)
print("STATUS       : PASS")
print("MODEL        :", type(model).__name__)
print("EVENT        :", type(event).__name__)
print("EVENT TYPE   :", event.event_type)
print("STAGE        :", event.stage)
print("AUTHORITY    :", event.authority)
print("OUTPUT       :", output.relative_to(ROOT))
print("=" * 80)
