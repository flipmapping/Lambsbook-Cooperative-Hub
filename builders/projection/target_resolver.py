"""
PB-004F
Canonical Target Resolver

Deterministically resolves renderer implementations
without performing rendering.
"""

from __future__ import annotations

from projection_models import ProjectionModel
from renderers import ClaudeRenderer


class UnsupportedExecutionTarget(ValueError):
    """Raised when no renderer exists for an execution target."""


class TargetResolver:
    """
    Canonical Target Resolver.

    Resolution preserves ProjectionModel identity.
    """

    _REGISTRY = {
        "claude": ClaudeRenderer,
    }

    def resolve(
        self,
        model: ProjectionModel,
    ):
        """
        Resolve the renderer implementation for a ProjectionModel.
        """

        renderer_cls = self._REGISTRY.get(model.execution_target)

        if renderer_cls is None:
            raise UnsupportedExecutionTarget(
                f"Unsupported execution target: {model.execution_target}"
            )

        return renderer_cls()
