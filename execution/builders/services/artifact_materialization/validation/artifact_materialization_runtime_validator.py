"""
==================================================
AMS-VAL-001

Artifact Materialization Service

Runtime Validator

Authority:
    IAS-001

Authority Registry:
    Approved

Sprint:
    SFP Sprint 1 — Foundation

Builder Version:
    0.1.0

Status:
    Bootstrap

Generated:
    2026-07-09T11:45:40.433132Z
==================================================
"""

from pathlib import Path
import importlib.util


def validate_module(module_path: Path) -> bool:
    """
    Validate that the AMS implementation module exists
    and can be imported without execution errors.
    """
    if not module_path.exists():
        return False

    spec = importlib.util.spec_from_file_location(
        "artifact_materialization_service",
        module_path
    )

    if spec is None or spec.loader is None:
        return False

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return hasattr(module, "ArtifactMaterializationService")
