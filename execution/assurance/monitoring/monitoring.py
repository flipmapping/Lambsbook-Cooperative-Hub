"""
Execution Assurance Monitoring Foundation.
"""

from dataclasses import dataclass, field


@dataclass
class MonitoringService:
    """
    Minimal in-memory monitoring service.
    """

    _events: list[str] = field(default_factory=list)

    def record(self, event: str) -> None:
        self._events.append(event)

    def count(self) -> int:
        return len(self._events)
