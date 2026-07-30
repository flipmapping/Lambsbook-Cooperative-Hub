"""
PB-004E
Canonical Semantic Deriver

Transforms a validated immutable Execution Contract into the
canonical Projection Model.

Internal derivation phases remain encapsulated.
"""

from __future__ import annotations

from collections.abc import Mapping

from projection_models import ProjectionModel


class SemanticDeriver:
    """
    Canonical Semantic Deriver.

    Identity Preservation:
        The supplied Execution Contract is never modified.
        The first new canonical artifact created is the
        ProjectionModel.
    """

    def derive(
        self,
        contract: Mapping,
    ) -> ProjectionModel:
        """
        Derive a ProjectionModel from a validated contract.
        """

        execution = contract["execution"]

        return ProjectionModel.from_components(
            execution_contract_id=contract["execution_contract_id"],
            provenance=contract["contract_provenance"],
            execution_target=execution["target"],
            semantic_sections=tuple(execution.keys()),
        )
