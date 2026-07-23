"""
PB-006
Builder Certification Execution

Executes the completed Projection Builder against a
canonical Execution Contract and emits deterministic
certification evidence.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from contract_loader import load_execution_contract
from certify_builder import certify_builder


def main() -> int:
    if len(sys.argv) != 2:
        print(
            "Usage:\n"
            "    run_builder_certification.py <execution_contract.json>"
        )
        return 1

    contract_path = Path(sys.argv[1])

    contract = load_execution_contract(contract_path)

    evidence = certify_builder(contract)

    print(json.dumps(evidence, indent=2, sort_keys=True))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
