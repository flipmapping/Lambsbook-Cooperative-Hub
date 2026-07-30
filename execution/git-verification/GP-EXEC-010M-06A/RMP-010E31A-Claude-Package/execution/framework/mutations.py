from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from typing import Sequence

from .corridors import CorridorVerifier


@dataclass(frozen=True)
class Mutation:
    """
    Immutable declarative repository edit specification.
    """

    target: Path

    anchor: str

    operation: str

    payload: str

    verification: str

    @property
    def fingerprint(self) -> str:

        payload = "::".join(
            (
                str(self.target.resolve()),
                self.anchor,
                self.operation,
                self.payload,
                self.verification,
            )
        )

        return sha256(
            payload.encode("utf-8")
        ).hexdigest()


@dataclass(frozen=True)
class MutationPlanEntry:
    """
    Planned execution of a mutation.
    """

    mutation: Mutation

    sequence: int


@dataclass(frozen=True)
class MutationPlan:
    """
    Ordered mutation plan.
    """

    entries: tuple[MutationPlanEntry, ...]

    @property
    def plan_id(self) -> str:

        payload = "|".join(
            entry.mutation.fingerprint
            for entry in self.entries
        )

        return sha256(
            payload.encode("utf-8")
        ).hexdigest()


class MutationEngine:
    """
    Plans repository mutations without executing them.
    """

    @staticmethod
    def plan(
        repository_root: Path,
        mutation: Mutation,
    ) -> MutationPlan:

        return MutationEngine.plan_many(
            repository_root,
            (mutation,),
        )

    @staticmethod
    def plan_many(
        repository_root: Path,
        mutations: Sequence[Mutation],
    ) -> MutationPlan:

        entries: list[MutationPlanEntry] = []

        for sequence, mutation in enumerate(mutations):

            result = CorridorVerifier.verify(
                repository_root,
                mutation.target,
            )

            if not result.authorized:

                raise ValueError(
                    "Mutation target lies outside the authorized repository corridor."
                )

            entries.append(
                MutationPlanEntry(
                    mutation=mutation,
                    sequence=sequence,
                )
            )

        return MutationPlan(
            entries=tuple(entries),
        )