"""
Execution Assurance Compliance Foundation.
"""

from dataclasses import dataclass, field


@dataclass
class ComplianceValidator:
    """
    Minimal in-memory compliance validator.
    """

    _rules: set[str] = field(default_factory=set)

    def register(self, rule: str) -> None:
        self._rules.add(rule)

    def registered(self, rule: str) -> bool:
        return rule in self._rules
