"""
PB-004G
Canonical Claude Renderer

Transforms a ProjectionModel into a deterministic
Claude-compatible projection.
"""

from __future__ import annotations

from projection_models import ProjectionModel


class ClaudeRenderer:
    """
    Canonical Claude Renderer.

    Representation only.

    The ProjectionModel remains unchanged.
    """

    def render(
        self,
        model: ProjectionModel,
    ) -> str:
        """
        Render a deterministic Claude projection.
        """

        sections = "\n".join(
            f"- {section}"
            for section in model.semantic_sections
        )

        return f"""# Claude Projection

Execution Contract:
{model.execution_contract_id}

Execution Target:
{model.execution_target}

Semantic Sections:
{sections}
"""
