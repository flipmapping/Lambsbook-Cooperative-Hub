from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from .anchors import AnchorVerifier
from .mutations import MutationPlan


@dataclass(frozen=True)
class VerificationResult:
    """
    Deterministic verification result for a planned mutation.
    """

    authorized: bool
    anchor_exists: bool
    verified: bool


@dataclass(frozen=True)
class DuplicateDetectionResult:
    """
    Duplicate mutation analysis.
    """

    duplicate_count: int
    unique_count: int
    has_duplicates: bool


@dataclass(frozen=True)
class SemanticOrderingResult:
    """
    Semantic ordering analysis.
    """

    ordered: bool
    expected_sequence: tuple[int, ...]
    actual_sequence: tuple[int, ...]


class VerificationEngine:
    """
    Verifies planned repository mutations.
    """

    @staticmethod
    def verify(plan) -> VerificationResult:

        anchor = AnchorVerifier.verify(
            plan.entries[0].mutation.target,
        )

        verified = (
            anchor.exists
        )

        return VerificationResult(
            authorized=True,
            anchor_exists=anchor.exists,
            verified=verified,
        )

    @staticmethod
    def detect_duplicates(
        plans: Sequence[MutationPlan],
    ) -> DuplicateDetectionResult:

        fingerprints = [
            plan.plan_id
            for plan in plans
        ]

        unique = len(set(fingerprints))
        total = len(fingerprints)

        return DuplicateDetectionResult(
            duplicate_count=total - unique,
            unique_count=unique,
            has_duplicates=(unique != total),
        )

    @staticmethod
    def verify_semantic_order(
        plan: MutationPlan,
    ) -> SemanticOrderingResult:

        actual = tuple(
            entry.sequence
            for entry in plan.entries
        )

        expected = tuple(
            range(len(actual))
        )

        return SemanticOrderingResult(
            ordered=(actual == expected),
            expected_sequence=expected,
            actual_sequence=actual,
        )
