from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AnchorResult:
    path: Path
    exists: bool


class AnchorVerifier:
    """Verifies repository anchors using the local filesystem."""

    @staticmethod
    def verify(path: Path) -> AnchorResult:
        resolved = path.resolve()
        return AnchorResult(
            path=resolved,
            exists=resolved.exists(),
        )
