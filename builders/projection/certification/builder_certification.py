"""
Builder Certification Facade

Canonical public entry point for the Builder Certification subsystem.
"""

from __future__ import annotations

from builder_certification_pipeline import run_pipeline


def certify_builder() -> dict:
    """
    Execute the canonical Builder certification workflow.
    """
    return run_pipeline()


def main() -> int:
    result = certify_builder()

    import json
    print(json.dumps(result, indent=2, sort_keys=True))

    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
