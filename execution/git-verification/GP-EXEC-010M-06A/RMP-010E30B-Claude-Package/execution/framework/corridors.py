from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class CorridorResult:
    repository_root: Path
    candidate: Path
    authorized: bool


class CorridorVerifier:
    """Verifies that a candidate path lies within an authorized repository corridor."""

    @staticmethod
    def verify(repository_root: Path, candidate: Path) -> CorridorResult:
        root = repository_root.resolve()
        target = candidate.resolve()

        try:
            target.relative_to(root)
            authorized = True
        except ValueError:
            authorized = False

        return CorridorResult(
            repository_root=root,
            candidate=target,
            authorized=authorized,
        )
