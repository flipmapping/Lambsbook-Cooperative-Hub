"""
PB-004B
Canonical Execution Contract Loader
"""

from __future__ import annotations

import json
from pathlib import Path
from types import MappingProxyType


class ContractLoaderError(RuntimeError):
    """Raised when an Execution Contract cannot be loaded."""


def load_execution_contract(path: str):
    """
    Load a canonical Execution Contract.

    Responsibilities:
        - Read JSON
        - Parse JSON
        - Return immutable mapping

    Explicitly does NOT:
        - Validate semantics
        - Derive projections
        - Resolve renderers
    """

    contract_path = Path(path)

    if not contract_path.exists():
        raise ContractLoaderError(
            f"Execution Contract not found: {contract_path}"
        )

    if not contract_path.is_file():
        raise ContractLoaderError(
            f"Execution Contract is not a file: {contract_path}"
        )

    try:
        with contract_path.open("r", encoding="utf-8") as fp:
            data = json.load(fp)
    except json.JSONDecodeError as exc:
        raise ContractLoaderError(
            f"Malformed Execution Contract: {contract_path}"
        ) from exc

    return MappingProxyType(data)
