"""
Execution Assurance Integration Layer.
"""

from dataclasses import dataclass, field

from execution.assurance.runtime import ExecutionAssuranceRuntime
from execution.assurance.metrics import MetricsRegistry
from execution.assurance.compliance import ComplianceValidator
from execution.assurance.monitoring import MonitoringService


@dataclass
class ExecutionAssurance:
    """
    Canonical façade over the Execution Assurance foundations.
    """

    runtime: ExecutionAssuranceRuntime = field(default_factory=ExecutionAssuranceRuntime)
    metrics: MetricsRegistry = field(default_factory=MetricsRegistry)
    compliance: ComplianceValidator = field(default_factory=ComplianceValidator)
    monitoring: MonitoringService = field(default_factory=MonitoringService)

    def status(self) -> str:
        return self.runtime.status()
