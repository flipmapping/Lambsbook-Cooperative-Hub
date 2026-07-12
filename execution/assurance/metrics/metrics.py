"""
Execution Assurance Metrics Foundation.
"""

from dataclasses import dataclass, field


@dataclass
class MetricsRegistry:
    """
    Minimal in-memory metrics registry.
    """

    _metrics: dict[str, int] = field(default_factory=dict)

    def increment(self, name: str, value: int = 1) -> None:
        self._metrics[name] = self._metrics.get(name, 0) + value

    def value(self, name: str) -> int:
        return self._metrics.get(name, 0)
