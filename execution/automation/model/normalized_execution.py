from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(frozen=True)
class NormalizedExecution:

    checkpoint_id: str
    execution_id: str
    pipeline: str
    execution_state: str
    schema_version: str

    completed_stages: List[str] = field(default_factory=list)
    pending_stages: List[str] = field(default_factory=list)

    authorized_mutations: List[str] = field(default_factory=list)
    blocked_mutations: List[str] = field(default_factory=list)

    dependencies: List[str] = field(default_factory=list)

    resume_from: Optional[str] = None
    evidence_boundary: Optional[str] = None
    generated_at: Optional[str] = None
