from dataclasses import dataclass, field
from typing import Any

@dataclass
class CanonicalExecutionModel:
    execution_authority: dict = field(default_factory=dict)
    implementation_context: dict = field(default_factory=dict)
    repository: dict = field(default_factory=dict)

    resolved_authorities: list = field(default_factory=list)
    resolved_dependencies: list = field(default_factory=list)

    validation: dict = field(default_factory=dict)
    normalization: dict = field(default_factory=dict)

    builder_input: dict | None = None

    explainability: dict = field(default_factory=dict)
