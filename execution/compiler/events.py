from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

@dataclass(frozen=True)
class ExecutionEvent:
    event_type: str
    stage: str
    authority: str
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    payload: dict[str, Any] = field(default_factory=dict)
    diagnostics: list[str] = field(default_factory=list)
