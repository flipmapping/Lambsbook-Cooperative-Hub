from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from datetime import datetime


@dataclass(frozen=True)
class ExecutionContext:
    implementation_authority: str
    repository_root: Path
    created_at: datetime

    @classmethod
    def create(cls, implementation_authority: str, repository_root: Path):
        return cls(
            implementation_authority=implementation_authority,
            repository_root=repository_root.resolve(),
            created_at=datetime.utcnow(),
        )
