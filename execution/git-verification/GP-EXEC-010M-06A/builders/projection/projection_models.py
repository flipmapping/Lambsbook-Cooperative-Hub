"""
PB-004D
Canonical Projection Model

This module defines the canonical semantic intermediate
representation produced by the Projection Builder.
"""

from __future__ import annotations

from dataclasses import dataclass
from types import MappingProxyType
from typing import Mapping, Tuple


@dataclass(frozen=True)
class ProjectionModel:
    """
    Canonical semantic representation.

    Renderer-independent.
    Immutable.
    """

    execution_contract_id: str
    provenance: Mapping
    execution_target: str
    semantic_sections: Tuple[str, ...]

    @staticmethod
    def from_components(
        execution_contract_id: str,
        provenance: Mapping,
        execution_target: str,
        semantic_sections: Tuple[str, ...],
    ) -> "ProjectionModel":

        return ProjectionModel(
            execution_contract_id=execution_contract_id,
            provenance=MappingProxyType(dict(provenance)),
            execution_target=execution_target,
            semantic_sections=tuple(semantic_sections),
        )
