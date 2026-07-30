from __future__ import annotations

from dataclasses import dataclass

from .applier import Replacement
from .mutations import Mutation


@dataclass(frozen=True)
class RealizationResult:
            """
            Internal execution representation.

            Deterministically adapts a Repository Edit Specification
            into the internal Replacement representation required by
            the MutationApplier.
            """

            replacements: tuple[Replacement, ...]


class MutationRealizer:
            """
            Deterministic realization adapter.

            Performs no repository reasoning.
            Performs no inference.
            Performs no interpretation.
            """

            @staticmethod
            def realize(
                mutation: Mutation,
            ) -> RealizationResult:

                if mutation.operation != "replace":
                    raise ValueError(
                        f"Unsupported operation: {mutation.operation}"
                    )

                return RealizationResult(
                    replacements=(
                        Replacement(
                            before=mutation.anchor,
                            after=mutation.payload,
                        ),
                    ),
                )